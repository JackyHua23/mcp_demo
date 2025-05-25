# FFmpeg MCP 智能视频处理助手 - Web 版

基于您的 `ffmpeg_mcp_demo.py` 创建的现代化 Web 前端界面，提供直观的图形化操作体验。

## 🌟 功能特性

### 🎯 核心功能
- **智能对话处理**: 使用自然语言描述视频处理需求
- **文件管理**: 拖拽上传、文件列表管理、下载删除
- **快速操作**: 预设的常用视频处理操作
- **实时反馈**: 处理进度显示和结果通知

### 🛠️ 支持的视频操作
- 📹 获取视频信息（时长、分辨率、编码等）
- ✂️ 视频剪切（指定时间段）
- 🔗 视频合并（多个文件拼接）
- 📐 视频缩放（调整分辨率）
- 🎭 视频叠加（画中画效果）
- 🎵 音频提取
- 🖼️ 帧提取（生成图片）
- ▶️ 视频播放

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）
```bash
python start_web.py
```

### 方法二：手动启动
1. 安装依赖：
```bash
pip install -r web_requirements.txt
```

2. 启动应用：
```bash
python app.py
```

3. 打开浏览器访问：http://localhost:8000

## 📁 项目结构

```
├── app.py                 # FastAPI 后端应用
├── start_web.py          # 启动脚本
├── web_requirements.txt  # Web 依赖
├── static/              # 静态文件目录
│   ├── index.html       # 主页面
│   ├── style.css        # 样式文件
│   └── script.js        # JavaScript 逻辑
├── uploads/             # 上传文件目录
└── outputs/             # 输出文件目录
```

## 🎨 界面介绍

### 左侧面板
- **文件上传**: 支持拖拽上传多个视频文件
- **文件管理**: 查看上传和输出文件，支持下载删除
- **可用工具**: 显示所有可用的 FFmpeg 工具

### 右侧工作区
- **AI 智能处理**: 聊天式交互，自然语言描述需求
- **快速操作**: 预设的常用操作按钮

## 💬 使用示例

### 自然语言交互
```
用户: "将 video.mp4 从第10秒开始剪切30秒的内容"
助手: 正在处理您的请求...已生成剪切后的视频文件
```

### 快速操作
1. 选择文件
2. 点击对应操作按钮
3. 填写必要参数
4. 执行操作

## 🔧 API 接口

### 主要端点
- `GET /` - 主页面
- `POST /api/upload` - 文件上传
- `GET /api/files` - 获取文件列表
- `POST /api/process` - 处理视频请求
- `GET /api/tools` - 获取可用工具
- `GET /api/download/{type}/{filename}` - 文件下载
- `DELETE /api/files/{type}/{filename}` - 文件删除

### API 文档
启动应用后访问：http://localhost:8000/docs

## 🎯 技术栈

### 后端
- **FastAPI**: 现代化的 Python Web 框架
- **Uvicorn**: ASGI 服务器
- **Pydantic**: 数据验证

### 前端
- **HTML5**: 语义化标记
- **CSS3**: 现代化样式（Grid、Flexbox、动画）
- **JavaScript ES6+**: 原生 JavaScript，无框架依赖
- **Font Awesome**: 图标库

### 设计特性
- 🎨 现代化 UI 设计
- 📱 响应式布局
- 🌈 渐变背景和毛玻璃效果
- ⚡ 流畅的动画过渡
- 🔔 实时通知系统

## 🔒 安全考虑

- 文件类型验证
- 文件大小限制
- 路径安全检查
- CORS 配置

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   lsof -i :8000
   # 或修改 app.py 中的端口号
   ```

2. **依赖安装失败**
   ```bash
   # 升级 pip
   pip install --upgrade pip
   # 重新安装依赖
   pip install -r web_requirements.txt
   ```

3. **FFmpeg MCP 连接失败**
   - 确保 `ffmpeg-mcp` 目录存在
   - 检查 `ffmpeg_mcp_demo.py` 配置
   - 验证 NVIDIA API 密钥

## 📝 开发说明

### 自定义配置
在 `app.py` 中可以修改：
- 服务器端口
- 文件上传限制
- API 密钥配置

### 扩展功能
- 添加新的视频处理工具
- 自定义 UI 主题
- 集成更多 AI 模型

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目基于原有的 FFmpeg MCP 项目构建，请遵循相应的许可证条款。 