// 全局变量
let selectedFiles = new Set();
let selectedFileNames = new Map(); // 存储路径到文件名的映射
let currentTab = 'uploaded';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    setupEventListeners();
    loadTools();
    refreshFiles();
    
    // 设置回车键发送消息
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 文件上传
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

// 处理文件选择
function handleFileSelect(event) {
    const files = event.target.files;
    uploadFiles(files);
}

// 处理拖拽悬停
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

// 处理拖拽离开
function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

// 处理文件拖拽
function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    uploadFiles(files);
}

// 上传文件
async function uploadFiles(files) {
    if (files.length === 0) return;
    
    showLoading(true);
    
    for (let file of files) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(`文件 ${file.name} 上传成功`, 'success');
            } else {
                showNotification(`文件 ${file.name} 上传失败`, 'error');
            }
        } catch (error) {
            console.error('上传错误:', error);
            showNotification(`文件 ${file.name} 上传失败: ${error.message}`, 'error');
        }
    }
    
    showLoading(false);
    refreshFiles();
    
    // 清空文件输入
    document.getElementById('fileInput').value = '';
}

// 加载可用工具
async function loadTools() {
    try {
        const response = await fetch('/api/tools');
        const data = await response.json();
        
        const toolsList = document.getElementById('toolsList');
        toolsList.innerHTML = '';
        
        data.tools.forEach(tool => {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';
            toolItem.textContent = tool;
            toolsList.appendChild(toolItem);
        });
    } catch (error) {
        console.error('加载工具失败:', error);
        document.getElementById('toolsList').innerHTML = '<div class="loading">加载失败</div>';
    }
}

// 刷新文件列表
async function refreshFiles() {
    try {
        const response = await fetch('/api/files');
        const data = await response.json();
        
        updateFileList('uploadedFiles', data.uploaded_files, 'upload');
        updateFileList('outputFiles', data.output_files, 'output');
    } catch (error) {
        console.error('刷新文件列表失败:', error);
        showNotification('刷新文件列表失败', 'error');
    }
}

// 更新文件列表
function updateFileList(containerId, files, fileType) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (files.length === 0) {
        container.innerHTML = '<div class="loading">暂无文件</div>';
        return;
    }
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.onclick = () => toggleFileSelection(fileItem, file.path, file.name);
        
        // 存储路径到文件名的映射
        selectedFileNames.set(file.path, file.name);
        
        // 检查是否是媒体文件
        const isMediaFile = isVideoOrAudioFile(file.name);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-actions">
                ${isMediaFile ? `
                    <button class="btn btn-preview" onclick="previewMedia('${fileType}', '${file.name}', '${file.path}'); event.stopPropagation();" title="预览">
                        <i class="fas fa-play"></i>
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="downloadFile('${fileType}', '${file.name}'); event.stopPropagation();" title="下载">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteFile('${fileType}', '${file.name}'); event.stopPropagation();" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(fileItem);
    });
}

// 切换文件选择
function toggleFileSelection(element, filePath, fileName) {
    if (selectedFiles.has(filePath)) {
        selectedFiles.delete(filePath);
        element.classList.remove('selected');
    } else {
        selectedFiles.add(filePath);
        element.classList.add('selected');
    }
}

// 切换标签页
function switchTab(tab) {
    currentTab = tab;
    
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 显示/隐藏文件列表
    document.getElementById('uploadedFiles').classList.toggle('hidden', tab !== 'uploaded');
    document.getElementById('outputFiles').classList.toggle('hidden', tab !== 'output');
}

// 发送消息
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 构建包含选中文件信息的完整消息
    let fullMessage = message;
    
    // 如果有选中的文件，添加文件信息到消息中
    if (selectedFiles.size > 0) {
        const selectedFilePaths = Array.from(selectedFiles);
        const fileInfo = selectedFilePaths.map(path => {
            const fileName = selectedFileNames.get(path) || path;
            return `文件路径: ${path} (文件名: ${fileName})`;
        }).join('\n');
        
        fullMessage = `${message}\n\n当前选中的文件:\n${fileInfo}`;
    }
    
    // 添加用户消息到聊天（只显示原始消息，不显示文件路径）
    addMessage(message, 'user');
    input.value = '';
    
    // 创建一个临时的助手消息用于显示流式内容
    const tempMessageId = 'temp-' + Date.now();
    addStreamMessage('正在处理...', 'assistant', tempMessageId);
    
    try {
        const response = await fetch('/api/process-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: fullMessage })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // 保留不完整的行
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        handleStreamMessage(data, tempMessageId);
                    } catch (e) {
                        console.error('解析流数据失败:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('发送消息失败:', error);
        updateStreamMessage('发送消息失败，请检查网络连接', tempMessageId);
    }
    
    refreshFiles(); // 刷新文件列表，可能有新的输出文件
}

// 直接发送消息（用于快速操作）
async function sendMessageDirect(message) {
    // 构建包含选中文件信息的完整消息
    let fullMessage = message;
    
    // 如果有选中的文件，添加文件信息到消息中
    if (selectedFiles.size > 0) {
        const selectedFilePaths = Array.from(selectedFiles);
        const fileInfo = selectedFilePaths.map(path => {
            const fileName = selectedFileNames.get(path) || path;
            return `文件路径: ${path} (文件名: ${fileName})`;
        }).join('\n');
        
        fullMessage = `${message}\n\n当前选中的文件:\n${fileInfo}`;
    }
    
    // 添加用户消息到聊天
    addMessage(message, 'user');
    
    // 创建一个临时的助手消息用于显示流式内容
    const tempMessageId = 'temp-' + Date.now();
    addStreamMessage('正在处理...', 'assistant', tempMessageId);
    
    try {
        const response = await fetch('/api/process-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: fullMessage })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // 保留不完整的行
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        handleStreamMessage(data, tempMessageId);
                    } catch (e) {
                        console.error('解析流数据失败:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('发送消息失败:', error);
        updateStreamMessage('发送消息失败，请检查网络连接', tempMessageId);
    }
    
    refreshFiles(); // 刷新文件列表，可能有新的输出文件
}

// 添加消息到聊天
function addMessage(content, type) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const icon = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="${icon}"></i>
            <div class="text">
                <p>${content.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加流式消息到聊天
function addStreamMessage(content, type, messageId) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.id = messageId;
    
    const icon = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="${icon}"></i>
            <div class="text">
                <div class="thinking-section">
                    <div class="thinking-header">
                        <i class="fas fa-brain"></i>
                        <span>思考过程</span>
                        <button class="toggle-thinking" onclick="toggleThinking('${messageId}')">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                    </div>
                    <div class="thinking-content">
                        <p class="thinking-text">${content}</p>
                        <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
                <div class="result-section" style="display: none;">
                    <div class="result-header">
                        <i class="fas fa-check-circle"></i>
                        <span>处理结果</span>
                    </div>
                    <div class="result-content markdown-content"></div>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 更新流式消息内容
function updateStreamMessage(content, messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const contentElement = messageElement.querySelector('.stream-content');
        const typingIndicator = messageElement.querySelector('.typing-indicator');
        
        if (contentElement) {
            contentElement.innerHTML = content.replace(/\n/g, '<br>');
        }
        
        // 移除打字指示器
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 追加流式内容
function appendStreamContent(content, messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const contentElement = messageElement.querySelector('.stream-content');
        
        if (contentElement) {
            const currentContent = contentElement.innerHTML;
            contentElement.innerHTML = currentContent + content.replace(/\n/g, '<br>');
        }
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 移除打字指示器
function removeTypingIndicator(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const typingIndicator = messageElement.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // 标记流式内容为完成状态，移除光标效果
        const contentElement = messageElement.querySelector('.stream-content');
        if (contentElement) {
            contentElement.classList.add('completed');
        }
    }
}

// 处理流式消息
function handleStreamMessage(data, messageId) {
    switch (data.type) {
        case 'start':
        case 'progress':
            updateThinkingProcess(data.message, messageId);
            break;
        case 'thinking':
            // 处理AI的思考过程内容
            updateThinkingContent(data.message, messageId);
            break;
        case 'thinking_end':
            // 思考过程结束，准备显示结果
            finalizeThinkingProcess(messageId);
            break;
        case 'response_start':
            // 开始接收响应内容，创建结果区域
            createResultSection(messageId);
            break;
        case 'response_chunk':
            // 逐步添加响应内容
            appendResultContent(data.content, messageId);
            break;
        case 'response_end':
            // 响应内容发送完毕，完成处理
            finalizeMessage(messageId);
            break;
        case 'success':
            updateThinkingProcess(data.message, messageId);
            break;
        case 'error':
            updateStreamMessage(`❌ ${data.message}`, messageId);
            break;
        case 'end':
            // 处理结束，可以在这里做一些清理工作
            break;
    }
}

// 快速操作
async function quickAction(action) {
    if (selectedFiles.size === 0) {
        showNotification('请先选择文件', 'warning');
        return;
    }
    
    const selectedFilePath = Array.from(selectedFiles)[0];
    const selectedFileName = selectedFileNames.get(selectedFilePath) || selectedFilePath;
    let message = '';
    
    switch (action) {
        case 'info':
            message = `获取 ${selectedFilePath} 的详细信息`;
            break;
        case 'clip':
            const start = document.getElementById('clipStart').value;
            const duration = document.getElementById('clipDuration').value;
            if (!start || !duration) {
                showNotification('请输入开始时间和持续时间', 'warning');
                return;
            }
            message = `将 ${selectedFilePath} 从 ${start} 开始剪切 ${duration} 秒`;
            break;
        case 'concat':
            if (selectedFiles.size < 2) {
                showNotification('请选择至少两个文件进行合并', 'warning');
                return;
            }
            const files = Array.from(selectedFiles).join(', ');
            message = `合并这些视频文件: ${files}`;
            break;
        case 'scale':
            const width = document.getElementById('scaleWidth').value;
            const height = document.getElementById('scaleHeight').value;
            if (!width || !height) {
                showNotification('请输入目标宽度和高度', 'warning');
                return;
            }
            message = `将 ${selectedFilePath} 缩放到 ${width}x${height}`;
            break;
        case 'extract_audio':
            const audioFormat = document.getElementById('audioFormat').value;
            message = `从 ${selectedFilePath} 提取音频，格式为 ${audioFormat}`;
            break;
        default:
            return;
    }
    
    // 直接发送消息，不显示在输入框中
    sendMessageDirect(message);
}

// 下载文件
function downloadFile(fileType, filename) {
    const url = `/api/download/${fileType}/${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 删除文件
async function deleteFile(fileType, filename) {
    if (!confirm(`确定要删除文件 ${filename} 吗？`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/files/${fileType}/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`文件 ${filename} 已删除`, 'success');
            refreshFiles();
            
            // 从选中文件中移除
            selectedFiles.forEach(path => {
                if (path.includes(filename)) {
                    selectedFiles.delete(path);
                }
            });
        } else {
            showNotification(`删除文件失败`, 'error');
        }
    } catch (error) {
        console.error('删除文件失败:', error);
        showNotification(`删除文件失败: ${error.message}`, 'error');
    }
}

// 显示/隐藏加载指示器
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 更新思考过程
function updateThinkingProcess(content, messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const thinkingText = messageElement.querySelector('.thinking-text');
        if (thinkingText) {
            thinkingText.innerHTML = content.replace(/\n/g, '<br>');
        }
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 更新思考过程内容（AI的实际思考）
function updateThinkingContent(content, messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const thinkingText = messageElement.querySelector('.thinking-text');
        if (thinkingText) {
            // 将思考过程内容添加到现有内容中
            const currentContent = thinkingText.textContent || '';
            const newContent = currentContent + '\n' + content;
            thinkingText.innerHTML = renderMarkdown(newContent);
        }
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 完成思考过程
function finalizeThinkingProcess(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        // 移除思考过程的打字指示器
        const thinkingIndicator = messageElement.querySelector('.thinking-content .typing-indicator');
        if (thinkingIndicator) {
            thinkingIndicator.remove();
        }
        
        // 标记思考过程为完成状态
        const thinkingContent = messageElement.querySelector('.thinking-content');
        if (thinkingContent) {
            thinkingContent.classList.add('completed');
        }
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 创建结果区域
function createResultSection(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        // 隐藏思考过程的打字指示器
        const typingIndicator = messageElement.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        // 显示结果区域
        const resultSection = messageElement.querySelector('.result-section');
        if (resultSection) {
            resultSection.style.display = 'block';
        }
        
        // 添加结果区域的打字指示器
        const resultContent = messageElement.querySelector('.result-content');
        if (resultContent) {
            resultContent.innerHTML = `
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
        }
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 追加结果内容
function appendResultContent(content, messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const resultContent = messageElement.querySelector('.result-content');
        
        if (resultContent) {
            // 移除打字指示器（如果存在）
            const typingIndicator = resultContent.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            
            // 添加内容并渲染markdown
            const currentContent = resultContent.textContent || '';
            const newContent = currentContent + content;
            resultContent.innerHTML = renderMarkdown(newContent);
        }
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 完成消息处理
function finalizeMessage(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        // 移除所有打字指示器
        const typingIndicators = messageElement.querySelectorAll('.typing-indicator');
        typingIndicators.forEach(indicator => indicator.remove());
        
        // 标记思考过程为完成状态
        const thinkingContent = messageElement.querySelector('.thinking-content');
        if (thinkingContent) {
            thinkingContent.classList.add('completed');
        }
        
        // 标记结果内容为完成状态
        const resultContent = messageElement.querySelector('.result-content');
        if (resultContent) {
            resultContent.classList.add('completed');
        }
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 切换思考过程显示/隐藏
function toggleThinking(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const thinkingContent = messageElement.querySelector('.thinking-content');
        const toggleButton = messageElement.querySelector('.toggle-thinking i');
        
        if (thinkingContent && toggleButton) {
            const isVisible = thinkingContent.style.display !== 'none';
            
            if (isVisible) {
                thinkingContent.style.display = 'none';
                toggleButton.className = 'fas fa-chevron-down';
            } else {
                thinkingContent.style.display = 'block';
                toggleButton.className = 'fas fa-chevron-up';
            }
        }
    }
}

// 增强的markdown渲染器
function renderMarkdown(text) {
    if (!text) return '';
    
    // 移除可能存在的think标签
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
    text = text.replace(/<\/think>/g, '').replace(/<think>/g, '');
    
    // 转义HTML特殊字符
    text = text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // 渲染markdown语法
    text = text
        // 标题 (支持更多级别)
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        
        // 粗体和斜体
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        // 删除线
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        
        // 代码块 (支持语言标识)
        .replace(/```(\w+)?\n?([\s\S]*?)```/g, function(match, lang, code) {
            const language = lang ? ` class="language-${lang}"` : '';
            return `<pre><code${language}>${code.trim()}</code></pre>`;
        })
        .replace(/`(.*?)`/g, '<code>$1</code>')
        
        // 引用块
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        
        // 有序列表
        .replace(/^\d+\. (.*$)/gm, '<ol-item>$1</ol-item>')
        
        // 无序列表
        .replace(/^[\*\-\+] (.*$)/gm, '<ul-item>$1</ul-item>')
        
        // 链接
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        
        // 图片
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="markdown-image">')
        
        // 水平分割线
        .replace(/^---$/gm, '<hr>')
        
        // 表格 (简单支持)
        .replace(/\|(.+)\|/g, function(match, content) {
            const cells = content.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        })
        
        // 换行
        .replace(/\n/g, '<br>');
    
    // 包装列表项
    text = text.replace(/(<ul-item>.*?<\/ul-item>)/g, '<ul><li>$1</li></ul>')
               .replace(/<ul-item>(.*?)<\/ul-item>/g, '$1');
    
    text = text.replace(/(<ol-item>.*?<\/ol-item>)/g, '<ol><li>$1</li></ol>')
               .replace(/<ol-item>(.*?)<\/ol-item>/g, '$1');
    
    // 合并连续的列表
    text = text.replace(/<\/ul><br><ul>/g, '')
               .replace(/<\/ol><br><ol>/g, '');
    
    // 包装表格
    text = text.replace(/(<tr>.*?<\/tr>)/g, '<table class="markdown-table">$1</table>');
    
    return text;
}

// 检查是否是视频或音频文件
function isVideoOrAudioFile(filename) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v', '.3gp'];
    const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return videoExtensions.includes(extension) || audioExtensions.includes(extension);
}

// 检查是否是视频文件
function isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v', '.3gp'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return videoExtensions.includes(extension);
}

// 检查是否是音频文件
function isAudioFile(filename) {
    const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return audioExtensions.includes(extension);
}

// 预览媒体文件
function previewMedia(fileType, filename, filePath) {
    try {
        // 直接显示预览模态框，不获取额外信息
        showMediaPreview(fileType, filename, filePath);
    } catch (error) {
        console.error('预览媒体失败:', error);
        showNotification('预览媒体失败: ' + error.message, 'error');
    }
}

// 显示媒体预览模态框
function showMediaPreview(fileType, filename, filePath) {
    const modal = document.getElementById('mediaPreviewModal');
    const title = document.getElementById('previewTitle');
    const mediaContainer = document.getElementById('mediaContainer');
    const mediaInfoContainer = document.getElementById('mediaInfo');
    const downloadBtn = document.getElementById('downloadPreviewBtn');
    
    // 设置标题
    title.textContent = `预览: ${filename}`;
    
    // 清空容器
    mediaContainer.innerHTML = '';
    mediaInfoContainer.innerHTML = '';
    
    // 创建媒体元素
    const mediaUrl = `/api/media/${fileType}/${encodeURIComponent(filename)}`;
    
    if (isVideoFile(filename)) {
        // 创建视频元素
        const video = document.createElement('video');
        video.src = mediaUrl;
        video.controls = true;
        video.preload = 'metadata';
        video.style.maxWidth = '100%';
        video.style.maxHeight = '400px';
        
        // 添加错误处理
        video.onerror = function() {
            mediaContainer.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #718096;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>无法加载视频文件</p>
                    <p style="font-size: 0.9rem;">可能是格式不支持或文件损坏</p>
                </div>
            `;
        };
        
        mediaContainer.appendChild(video);
    } else if (isAudioFile(filename)) {
        // 创建音频元素
        const audio = document.createElement('audio');
        audio.src = mediaUrl;
        audio.controls = true;
        audio.preload = 'metadata';
        audio.style.width = '100%';
        
        // 添加错误处理
        audio.onerror = function() {
            mediaContainer.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #718096;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>无法加载音频文件</p>
                    <p style="font-size: 0.9rem;">可能是格式不支持或文件损坏</p>
                </div>
            `;
        };
        
        // 为音频添加可视化背景
        const audioWrapper = document.createElement('div');
        audioWrapper.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
        `;
        
        const audioIcon = document.createElement('div');
        audioIcon.innerHTML = `
            <i class="fas fa-music" style="font-size: 3rem; color: white; margin-bottom: 20px;"></i>
            <h4 style="color: white; margin-bottom: 20px;">${filename}</h4>
        `;
        
        audioWrapper.appendChild(audioIcon);
        audioWrapper.appendChild(audio);
        mediaContainer.appendChild(audioWrapper);
    }
    
    // 显示基本文件信息
    mediaInfoContainer.innerHTML = `
        <h4><i class="fas fa-info-circle"></i> 文件信息</h4>
        <div class="info-item">
            <span class="info-label">文件名</span>
            <span class="info-value">${filename}</span>
        </div>
        <div class="info-item">
            <span class="info-label">文件类型</span>
            <span class="info-value">${isVideoFile(filename) ? '视频文件' : '音频文件'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">文件路径</span>
            <span class="info-value">${filePath}</span>
        </div>
    `;
    
    // 设置下载按钮
    downloadBtn.onclick = () => downloadFile(fileType, filename);
    
    // 显示模态框
    modal.classList.add('show');
    
    // 添加ESC键关闭功能
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeMediaPreview();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// 关闭媒体预览
function closeMediaPreview() {
    const modal = document.getElementById('mediaPreviewModal');
    const mediaContainer = document.getElementById('mediaContainer');
    
    // 停止所有媒体播放
    const videos = mediaContainer.querySelectorAll('video');
    const audios = mediaContainer.querySelectorAll('audio');
    
    videos.forEach(video => {
        video.pause();
        video.src = '';
    });
    
    audios.forEach(audio => {
        audio.pause();
        audio.src = '';
    });
    
    // 隐藏模态框
    modal.classList.remove('show');
    
    // 清空容器
    setTimeout(() => {
        mediaContainer.innerHTML = '';
        document.getElementById('mediaInfo').innerHTML = '';
    }, 300);
}



// 修复刷新功能 - 确保按钮点击事件正确绑定
document.addEventListener('DOMContentLoaded', function() {
    // 确保刷新按钮事件正确绑定
    const refreshButton = document.querySelector('button[onclick="refreshFiles()"]');
    if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
            e.preventDefault();
            refreshFiles();
        });
    }
}); 