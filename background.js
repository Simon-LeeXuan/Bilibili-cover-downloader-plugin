// Background script for handling downloads
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadCovers') {
    downloadCoversSequentially(request.covers, request.progressCallback);
    sendResponse({success: true});
  }
});

// 逐个下载封面图
async function downloadCoversSequentially(covers, progressCallback) {
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < covers.length; i++) {
    const cover = covers[i];
    try {
      // 发送进度更新
      if (progressCallback) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'downloadProgress',
          current: i + 1,
          total: covers.length,
          title: cover.title,
          successCount: successCount,
          failCount: failCount
        });
      }
      
      // 使用Chrome下载API下载
      const extension = getFileExtension(cover.url);
      const filename = `B站封面/${cover.title}.${extension}`;
      
      await new Promise((resolve, reject) => {
        chrome.downloads.download({
          url: cover.url,
          filename: filename,
          saveAs: false
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error(`下载失败: ${cover.title}`, chrome.runtime.lastError);
            failCount++;
            reject(chrome.runtime.lastError);
          } else {
            successCount++;
            resolve();
          }
        });
      });
      
      // 添加延迟避免下载过快
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`下载失败: ${cover.title}`, error);
      failCount++;
    }
  }
  
  // 发送完成消息
  chrome.tabs.sendMessage(sender.tab.id, {
    action: 'downloadComplete',
    successCount: successCount,
    failCount: failCount,
    total: covers.length
  });
}

// 获取文件扩展名
function getFileExtension(url) {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match ? match[1].toLowerCase() : 'jpg';
} 