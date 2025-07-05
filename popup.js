document.addEventListener('DOMContentLoaded', function() {
  const scanCoversBtn = document.getElementById('scanCovers');
  const downloadAllBtn = document.getElementById('downloadAll');
  const statusDiv = document.getElementById('status');
  const countDiv = document.getElementById('count');
  const coverListDiv = document.getElementById('coverList');
  
  let currentCovers = [];

  // 扫描封面按钮点击事件
  scanCoversBtn.addEventListener('click', function() {
    updateStatus('正在扫描...', 'loading');
    scanCoversBtn.disabled = true;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      // 检查是否在B站页面
      if (!currentTab.url.includes('bilibili.com')) {
        updateStatus('请在B站页面使用此插件', 'error');
        scanCoversBtn.disabled = false;
        return;
      }
      
      // 向content script发送扫描请求
      chrome.tabs.sendMessage(currentTab.id, {action: 'scanCovers'}, function(response) {
        if (chrome.runtime.lastError) {
          updateStatus('扫描失败，请刷新页面重试', 'error');
          scanCoversBtn.disabled = false;
        }
      });
    });
  });
  
  // 下载所有封面按钮点击事件
  downloadAllBtn.addEventListener('click', function() {
    if (currentCovers.length === 0) {
      updateStatus('没有找到封面图', 'error');
      return;
    }
    
    updateStatus('正在准备下载...', 'loading');
    downloadAllBtn.disabled = true;
    
    // 使用background script进行下载
    chrome.runtime.sendMessage({
      action: 'downloadCovers',
      covers: currentCovers
    });
  });
  
  // 监听来自content script的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanResult') {
      currentCovers = request.covers;
      updateCoverList(currentCovers);
      updateStatus(`扫描完成，找到 ${currentCovers.length} 个封面`, 'success');
      scanCoversBtn.disabled = false;
      downloadAllBtn.disabled = currentCovers.length === 0;
    } else if (request.action === 'downloadProgress') {
      updateStatus(`正在下载 ${request.current}/${request.total}: ${request.title}`, 'loading');
    } else if (request.action === 'downloadComplete') {
      if (request.successCount > 0) {
        updateStatus(`下载完成！成功下载 ${request.successCount} 个封面，失败 ${request.failCount} 个`, 'success');
      } else {
        updateStatus('所有图片下载失败', 'error');
      }
      downloadAllBtn.disabled = false;
    }
  });
  
  // 更新状态显示
  function updateStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    if (type === 'success') {
      countDiv.textContent = `找到 ${currentCovers.length} 个封面`;
    }
  }
  
  // 更新封面列表显示
  function updateCoverList(covers) {
    coverListDiv.innerHTML = '';
    
    if (covers.length === 0) {
      coverListDiv.innerHTML = '<div class="loading">未找到封面图</div>';
      return;
    }
    
    covers.forEach((cover, index) => {
      const coverItem = document.createElement('div');
      coverItem.className = 'cover-item';
      coverItem.innerHTML = `
        <img src="${cover.thumbnail}" alt="${cover.title}" class="cover-image" onerror="this.style.display='none'">
        <div class="cover-title">${cover.title}</div>
      `;
      coverListDiv.appendChild(coverItem);
    });
  }
  

  
  // 获取文件扩展名
  function getFileExtension(url) {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
    return match ? match[1].toLowerCase() : 'jpg';
  }
  
  // 页面加载时检查当前页面
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab.url.includes('bilibili.com')) {
      updateStatus('准备就绪，点击扫描封面', '');
    } else {
      updateStatus('请在B站页面使用此插件', 'error');
      scanCoversBtn.disabled = true;
    }
  });
}); 