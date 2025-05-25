from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from typing import Optional, List, AsyncGenerator
import uvicorn
import json
import asyncio

# 导入我们的 FFmpeg MCP 客户端
from ffmpeg_mcp_demo import FFmpegMCPClient

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FFmpeg MCP 智能视频处理助手", version="1.0.0")

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 创建上传目录
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# 初始化 FFmpeg MCP 客户端
ffmpeg_client = FFmpegMCPClient()

# 请求模型
class VideoRequest(BaseModel):
    message: str
    video_path: Optional[str] = None

class VideoClipRequest(BaseModel):
    video_path: str
    start: Optional[str] = None
    end: Optional[str] = None
    duration: Optional[str] = None
    output_path: Optional[str] = None

class VideoConcatRequest(BaseModel):
    input_files: List[str]
    output_path: Optional[str] = None
    fast: bool = True

class VideoScaleRequest(BaseModel):
    video_path: str
    width: str
    height: str
    output_path: Optional[str] = None

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """返回主页面"""
    return FileResponse("static/index.html")

@app.get("/demo", response_class=HTMLResponse)
async def demo_separated():
    """返回AI回复分离演示页面"""
    return FileResponse("static/demo_separated.html")

@app.get("/api/tools")
async def get_tools():
    """获取可用的工具列表"""
    try:
        tools = ffmpeg_client.get_available_tools()
        return {"tools": tools}
    except Exception as e:
        logger.error(f"获取工具列表失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process")
async def process_video_request(request: VideoRequest):
    """处理视频相关请求"""
    try:
        response = await ffmpeg_client.process_video_request(request.message)
        return {"response": response, "success": True}
    except Exception as e:
        logger.error(f"处理请求失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process-stream")
async def process_video_request_stream(request: VideoRequest):
    """流式处理视频相关请求"""
    
    # 创建一个队列来存储进度消息
    progress_queue = asyncio.Queue()
    thinking_content = []  # 存储思考过程内容
    
    async def progress_callback(message):
        await progress_queue.put(message)
        # 如果是思考过程，单独存储
        if message.startswith("💭 AI思考过程："):
            thinking_content.append(message[8:])  # 移除前缀
    
    async def generate_stream():
        try:
            # 发送开始处理的消息
            start_msg = "🚀 开始处理您的请求..."
            yield f"data: {json.dumps({'type': 'start', 'message': start_msg})}\n\n"
            await asyncio.sleep(0.1)
            
            # 启动处理任务
            process_task = asyncio.create_task(
                ffmpeg_client.process_video_request_with_details(
                    request.message, 
                    progress_callback
                )
            )
            
            # 监听进度消息
            while not process_task.done():
                try:
                    # 等待进度消息，设置超时避免阻塞
                    message = await asyncio.wait_for(
                        progress_queue.get(), 
                        timeout=0.1
                    )
                    
                    # 区分思考过程和普通进度消息
                    if message.startswith("💭 AI思考过程："):
                        # 发送思考过程消息
                        thinking_data = {
                            'type': 'thinking', 
                            'message': message[8:]  # 移除前缀
                        }
                        yield f"data: {json.dumps(thinking_data)}\n\n"
                    else:
                        # 发送普通进度消息
                        progress_data = {'type': 'progress', 'message': message}
                        yield f"data: {json.dumps(progress_data)}\n\n"
                        
                except asyncio.TimeoutError:
                    # 没有新的进度消息，继续等待
                    continue
            
            # 获取最终结果
            response = await process_task
            
            # 处理队列中剩余的消息
            while not progress_queue.empty():
                message = await progress_queue.get()
                if message.startswith("💭 AI思考过程："):
                    thinking_data = {
                        'type': 'thinking', 
                        'message': message[8:]
                    }
                    yield f"data: {json.dumps(thinking_data)}\n\n"
                else:
                    progress_data = {'type': 'progress', 'message': message}
                    yield f"data: {json.dumps(progress_data)}\n\n"
            
            # 发送思考过程完成信号
            yield f"data: {json.dumps({'type': 'thinking_end'})}\n\n"
            
            # 开始流式发送最终响应
            yield f"data: {json.dumps({'type': 'response_start'})}\n\n"
            
            # 将响应按句子分割并逐步发送
            sentences = response.split('。')
            for i, sentence in enumerate(sentences):
                if sentence.strip():
                    # 添加句号（除了最后一句）
                    if i < len(sentences) - 1:
                        sentence += '。'
                    
                    stream_data = {
                        'type': 'response_chunk', 
                        'content': sentence
                    }
                    yield f"data: {json.dumps(stream_data)}\n\n"
                    await asyncio.sleep(0.3)  # 控制显示速度
            
            # 发送完成消息
            yield f"data: {json.dumps({'type': 'response_end'})}\n\n"
            yield f"data: {json.dumps({'type': 'end'})}\n\n"
            
        except Exception as e:
            logger.error(f"流式处理请求失败: {e}")
            error_msg = f"处理失败: {str(e)}"
            error_data = {'type': 'error', 'message': error_msg}
            yield f"data: {json.dumps(error_data)}\n\n"
            yield f"data: {json.dumps({'type': 'end'})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传视频文件"""
    try:
        # 检查文件类型
        allowed_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"不支持的文件格式。支持的格式: {', '.join(allowed_extensions)}"
            )
        
        # 保存文件
        file_path = os.path.join("uploads", file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "filename": file.filename,
            "file_path": file_path,
            "size": len(content),
            "success": True
        }
    except Exception as e:
        logger.error(f"文件上传失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files")
async def list_files():
    """列出上传的文件"""
    try:
        uploads_dir = "uploads"
        outputs_dir = "outputs"
        
        uploaded_files = []
        output_files = []
        
        if os.path.exists(uploads_dir):
            for filename in os.listdir(uploads_dir):
                file_path = os.path.join(uploads_dir, filename)
                if os.path.isfile(file_path):
                    uploaded_files.append({
                        "name": filename,
                        "path": os.path.abspath(file_path),  # 返回绝对路径
                        "size": os.path.getsize(file_path)
                    })
        
        if os.path.exists(outputs_dir):
            for filename in os.listdir(outputs_dir):
                file_path = os.path.join(outputs_dir, filename)
                if os.path.isfile(file_path):
                    output_files.append({
                        "name": filename,
                        "path": os.path.abspath(file_path),  # 返回绝对路径
                        "size": os.path.getsize(file_path)
                    })
        
        return {
            "uploaded_files": uploaded_files,
            "output_files": output_files
        }
    except Exception as e:
        logger.error(f"获取文件列表失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{file_type}/{filename}")
async def download_file(file_type: str, filename: str):
    """下载文件"""
    try:
        if file_type == "upload":
            file_path = os.path.join("uploads", filename)
        elif file_type == "output":
            file_path = os.path.join("outputs", filename)
        else:
            raise HTTPException(status_code=400, detail="无效的文件类型")
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="文件不存在")
        
        return FileResponse(
            file_path,
            filename=filename,
            media_type='application/octet-stream'
        )
    except Exception as e:
        logger.error(f"文件下载失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/files/{file_type}/{filename}")
async def delete_file(file_type: str, filename: str):
    """删除文件"""
    try:
        if file_type == "upload":
            file_path = os.path.join("uploads", filename)
        elif file_type == "output":
            file_path = os.path.join("outputs", filename)
        else:
            raise HTTPException(status_code=400, detail="无效的文件类型")
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return {"message": f"文件 {filename} 已删除", "success": True}
        else:
            raise HTTPException(status_code=404, detail="文件不存在")
    except Exception as e:
        logger.error(f"文件删除失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 