# B站封面批量下载器

一个Chrome浏览器扩展，用于批量下载B站页面上的所有封面图。

## 功能特点

- 🔍 **智能扫描**: 自动扫描B站页面上的所有封面图
- 📦 **批量下载**: 一键下载所有封面图到指定文件夹
- 🎯 **精准识别**: 支持多种B站页面布局，准确识别封面图
- 🖼️ **预览功能**: 扫描后可以预览所有找到的封面图
- 📝 **智能命名**: 自动提取视频标题作为文件名
- ⚡ **高效下载**: 并行下载，快速完成批量下载任务

## 使用方法

1. **安装扩展**: 将扩展加载到Chrome浏览器中
2. **访问B站**: 打开任意B站页面（如首页、搜索结果页、用户主页等）
3. **点击扩展**: 点击浏览器工具栏中的扩展图标
4. **扫描封面**: 点击"扫描封面"按钮，插件会自动扫描页面上的所有封面图
5. **预览结果**: 查看扫描到的封面图预览
6. **下载封面**: 点击"下载所有封面"按钮，插件会自动下载所有封面图到"B站封面"文件夹

## 支持的页面类型

- B站首页推荐
- 搜索结果页
- 用户主页
- 分区页面
- 收藏夹页面
- 其他包含视频封面的B站页面

## 技术特点

- 自动识别B站封面图URL
- 智能提取视频标题作为文件名
- 去除URL中的尺寸参数，获取原始高清图片
- 支持多种图片格式（JPG、PNG、WebP、AVIF）
- 支持Chrome下载API，安全可靠

## 安装方法

### 开发者模式安装

1. 打开Chrome浏览器，进入扩展管理页面 (`chrome://extensions/`)
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择包含扩展文件的文件夹
5. 扩展安装完成，可以在工具栏看到扩展图标

## 注意事项

- 仅支持B站网站（bilibili.com）
- 需要网络连接来下载图片
- 下载的图片质量取决于B站提供的原始图片质量
- 大量图片下载可能需要较长时间，请耐心等待

## 更新日志

### v1.0
- 初始版本发布
- 支持B站封面图批量扫描和下载
- 支持批量下载到指定文件夹
- 支持封面图预览功能

## 许可证

GPL-3.0 license
