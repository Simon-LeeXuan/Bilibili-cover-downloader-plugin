// 存储找到的封面信息
let coverList = [];

// 扫描页面中的封面图
function scanCovers() {
  coverList = [];
  
  // 查找所有可能的封面图元素
  const selectors = [
    '.bili-cover-card__thumbnail img',
    '.bili-video-card__cover img',
    '.bili-cover img',
    '.cover img',
    '.thumbnail img',
    '.video-cover img',
    '.bili-cover-card img',
    '.bili-video-card img'
  ];
  
  let allImages = [];
  selectors.forEach(selector => {
    const images = document.querySelectorAll(selector);
    allImages = allImages.concat(Array.from(images));
  });
  
  // 去重
  const uniqueImages = [...new Set(allImages)];
  
  uniqueImages.forEach(img => {
    const src = img.src || img.getAttribute('data-src');
    if (src && isBilibiliCover(src)) {
      const title = getImageTitle(img);
      const originalUrl = getOriginalCoverUrl(src);
      
      if (originalUrl) {
        coverList.push({
          url: originalUrl,
          title: title,
          thumbnail: src
        });
      }
    }
  });
  
  // 发送结果到popup
  chrome.runtime.sendMessage({
    action: 'scanResult',
    covers: coverList
  });
}

// 判断是否为B站封面图
function isBilibiliCover(src) {
  return src && (
    src.includes('hdslb.com') ||
    src.includes('bilibili.com') ||
    src.includes('bfs/archive')
  );
}

// 获取图片标题
function getImageTitle(img) {
  // 尝试多种方式获取标题
  let title = '';
  
  // 1. 从alt属性获取
  if (img.alt) {
    title = img.alt.trim();
  }
  
  // 2. 从父元素获取
  if (!title) {
    const parent = img.closest('.bili-cover-card, .bili-video-card, .video-item');
    if (parent) {
      const titleElement = parent.querySelector('.bili-cover-card__info__tit, .bili-video-card__info__tit, .title, .video-title');
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
    }
  }
  
  // 3. 从最近的标题元素获取
  if (!title) {
    const titleElement = img.closest('div').querySelector('h3, h4, .title, .tit');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }
  
  // 4. 如果都没有，使用默认标题
  if (!title) {
    title = `B站封面_${Date.now()}`;
  }
  
  // 清理标题，移除特殊字符
  title = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
  
  return title;
}

// 获取原始封面URL（去除尺寸参数）
function getOriginalCoverUrl(src) {
  if (!src) return null;
  
  // 处理相对URL
  if (src.startsWith('//')) {
    src = 'https:' + src;
  }
  
  // 移除尺寸参数，获取原始图片
  let originalUrl = src;
  
  // 移除常见的尺寸参数
  originalUrl = originalUrl.replace(/@\d+w_\d+h_\d+c\.(avif|webp|jpg|jpeg|png)/g, '');
  originalUrl = originalUrl.replace(/@\d+w_\d+h\.(avif|webp|jpg|jpeg|png)/g, '');
  originalUrl = originalUrl.replace(/@\d+w\.(avif|webp|jpg|jpeg|png)/g, '');
  originalUrl = originalUrl.replace(/@\d+h\.(avif|webp|jpg|jpeg|png)/g, '');
  
  // 确保是https
  if (originalUrl.startsWith('http://')) {
    originalUrl = originalUrl.replace('http://', 'https://');
  }
  
  return originalUrl;
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanCovers') {
    scanCovers();
    sendResponse({success: true});
  } else if (request.action === 'downloadProgress') {
    // 转发下载进度到popup
    chrome.runtime.sendMessage({
      action: 'downloadProgress',
      current: request.current,
      total: request.total,
      title: request.title,
      successCount: request.successCount,
      failCount: request.failCount
    });
  } else if (request.action === 'downloadComplete') {
    // 转发下载完成消息到popup
    chrome.runtime.sendMessage({
      action: 'downloadComplete',
      successCount: request.successCount,
      failCount: request.failCount,
      total: request.total
    });
  }
});

// 页面加载完成后自动扫描一次
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scanCovers);
} else {
  scanCovers();
}

// 监听页面变化（动态加载的内容）
const observer = new MutationObserver((mutations) => {
  // 延迟扫描，避免频繁触发
  clearTimeout(window.scanTimeout);
  window.scanTimeout = setTimeout(scanCovers, 1000);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});