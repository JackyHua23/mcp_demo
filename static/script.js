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
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-actions">
                <button class="btn btn-outline" onclick="downloadFile('${fileType}', '${file.name}'); event.stopPropagation();">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteFile('${fileType}', '${file.name}'); event.stopPropagation();">
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
    
    // 添加用户消息到聊天
    addMessage(message, 'user');
    input.value = '';
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addMessage(data.response, 'assistant');
        } else {
            addMessage('处理请求时发生错误', 'assistant');
        }
    } catch (error) {
        console.error('发送消息失败:', error);
        addMessage('发送消息失败，请检查网络连接', 'assistant');
    }
    
    showLoading(false);
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
    
    // 设置消息到输入框并发送
    document.getElementById('messageInput').value = message;
    sendMessage();
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