from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from typing import Optional, List
import uvicorn

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