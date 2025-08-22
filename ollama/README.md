# 🚀 Ollama AI Setup for Taskego

This guide will help you set up Ollama AI locally to power Taskego's intelligent chat assistant.

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Windows 10/11** (or macOS/Linux)
- **At least 8GB RAM** (16GB recommended)
- **10GB free disk space**

## 🐳 Quick Start (Windows)

### 1. Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Start Docker Desktop

### 2. Start Ollama
```bash
# Navigate to ollama folder
cd ollama

# Start Ollama container
start-ollama.bat
```

### 3. Download AI Models
```bash
# Download recommended models
download-models.bat
```

### 4. Test Ollama
```bash
# Verify everything works
test-ollama.bat
```

## 🔧 Manual Setup

### Start Ollama Container
```bash
docker-compose up -d
```

### Download Models
```bash
# Download Llama 3.2 3B (recommended)
docker exec taskego-ollama ollama pull llama3.2:3b-instruct

# Download Llama 3.2 8B (better quality)
docker exec taskego-ollama ollama pull llama3.2:8b-instruct

# Download Mistral 7B (alternative)
docker exec taskego-ollama ollama pull mistral:7b-instruct
```

### Check Status
```bash
# List running containers
docker ps

# Check Ollama logs
docker logs taskego-ollama

# List available models
docker exec taskego-ollama ollama list
```

## 🌐 Access Ollama

- **Web Interface**: http://localhost:11434
- **API Endpoint**: http://localhost:11434/api
- **Health Check**: http://localhost:11434/api/tags

## 🤖 Available Models

| Model | Size | Quality | Speed | RAM Usage | Recommendation |
|-------|------|---------|-------|-----------|----------------|
| `llama3.2:3b-instruct` | 3B | Good | Fast | 4GB | ✅ **Best for Taskego** |
| `llama3.2:8b-instruct` | 8B | Better | Medium | 8GB | ⚠️ Higher quality, slower |
| `mistral:7b-instruct` | 7B | Excellent | Medium | 7GB | 🔄 Alternative option |

## ⚙️ Configuration

### Environment Variables
Add to your `.env` file:
```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b-instruct
```

### Taskego Integration
Ollama automatically integrates with Taskego's AI chat:
- **Website-only responses** (strictly follows rules)
- **Bilingual support** (English/Arabic)
- **Service recommendations**
- **Booking assistance**
- **Provider guidance**

## 🚨 Troubleshooting

### Ollama won't start
```bash
# Check Docker status
docker info

# Check container logs
docker logs taskego-ollama

# Restart container
docker-compose restart
```

### Out of memory
```bash
# Use smaller model
OLLAMA_MODEL=llama3.2:3b-instruct

# Increase Docker memory limit in Docker Desktop settings
```

### Slow responses
```bash
# Use faster model
OLLAMA_MODEL=llama3.2:3b-instruct

# Check system resources
docker stats taskego-ollama
```

## 📊 Performance Tips

1. **Use 3B model** for development and testing
2. **Use 8B model** for production if you have 16GB+ RAM
3. **Close other applications** when using Ollama
4. **Monitor memory usage** in Task Manager

## 🔄 Updates

### Update Ollama
```bash
docker-compose pull
docker-compose up -d
```

### Update Models
```bash
docker exec taskego-ollama ollama pull llama3.2:3b-instruct
```

## 🛑 Stop Ollama

```bash
# Stop container
docker-compose down

# Remove container and data
docker-compose down -v
```

## 📚 Next Steps

1. **Test the AI chat** in Taskego
2. **Customize responses** by modifying system prompts
3. **Add more models** if needed
4. **Deploy to cloud** for production use

## 🆘 Need Help?

- Check Docker Desktop is running
- Verify port 11434 is not blocked
- Check system resources (RAM, disk space)
- Review container logs: `docker logs taskego-ollama`

---

**🎯 Goal**: Get Taskego's AI chat working with free, local AI models!
