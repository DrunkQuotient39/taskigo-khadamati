# Ollama Deployment Guide for Taskego

This guide covers different ways to deploy Ollama for your Taskego AI assistant.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker Desktop installed
- At least 4GB RAM available

### Steps
1. **Navigate to Ollama directory**:
   ```bash
   cd ollama
   ```

2. **Start Ollama**:
   ```bash
   # On Windows
   deploy.bat local
   
   # On Mac/Linux
   chmod +x deploy.sh
   ./deploy.sh local
   ```

3. **Pull models**:
   ```bash
   # On Windows
   deploy.bat models
   
   # On Mac/Linux
   ./deploy.sh models
   ```

4. **Test integration**:
   ```bash
   node test-integration.js
   ```

## ☁️ Cloud Deployment Options

### Option 1: DigitalOcean Droplet (Recommended)

**Cost**: $5-10/month  
**RAM**: 8GB minimum  
**Setup**: 15 minutes

#### Steps:
1. **Create Droplet**:
   - Go to [DigitalOcean](https://digitalocean.com)
   - Create new droplet
   - Choose Ubuntu 22.04 LTS
   - Select 8GB RAM plan
   - Add SSH key

2. **Connect to server**:
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   systemctl enable docker
   systemctl start docker
   ```

4. **Deploy Ollama**:
   ```bash
   # From your local machine
   export REMOTE_HOST=root@your-server-ip
   ./deploy.sh cloud
   ```

5. **Update environment**:
   ```bash
   # In your .env file
   OLLAMA_BASE_URL=http://your-server-ip:11434
   ```

### Option 2: Linode Node

**Cost**: $5-10/month  
**RAM**: 8GB minimum  
**Setup**: 15 minutes

#### Steps:
1. **Create Node**:
   - Go to [Linode](https://linode.com)
   - Create new Linode
   - Choose Ubuntu 22.04 LTS
   - Select 8GB RAM plan
   - Add SSH key

2. **Follow same steps as DigitalOcean** (Docker installation is identical)

### Option 3: AWS EC2 (Free Tier Eligible)

**Cost**: Free for 12 months, then $8-15/month  
**RAM**: 1GB free, 8GB paid  
**Setup**: 20 minutes

#### Steps:
1. **Launch Instance**:
   - Go to [AWS Console](https://aws.amazon.com/ec2/)
   - Launch EC2 instance
   - Choose Amazon Linux 2
   - Select t3.micro (free tier) or t3.medium (paid)
   - Configure security group to allow port 22 (SSH)

2. **Connect to instance**:
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Docker**:
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo systemctl enable docker
   sudo systemctl start docker
   sudo usermod -a -G docker ec2-user
   # Log out and back in
   ```

4. **Deploy Ollama**:
   ```bash
   # From your local machine
   export REMOTE_HOST=ec2-user@your-instance-ip
   ./deploy.sh cloud
   ```

### Option 4: Vultr Instance

**Cost**: $5-10/month  
**RAM**: 8GB minimum  
**Setup**: 15 minutes

#### Steps:
1. **Create Instance**:
   - Go to [Vultr](https://vultr.com)
   - Deploy new instance
   - Choose Ubuntu 22.04
   - Select 8GB RAM plan
   - Add SSH key

2. **Follow same steps as DigitalOcean**

## 🔧 Production Configuration

### Security Settings

1. **Firewall Configuration**:
   ```bash
   # Only allow connections from your backend
   sudo ufw allow from YOUR_BACKEND_IP to any port 11434
   sudo ufw enable
   ```

2. **Docker Security**:
   ```bash
   # Create non-root user
   sudo useradd -m -s /bin/bash ollama
   sudo usermod -aG docker ollama
   
   # Run container as non-root user
   docker run -u ollama:ollama ...
   ```

### Performance Optimization

1. **Model Selection**:
   ```bash
   # For production, use llama2:7b for speed
   OLLAMA_MODEL=llama2:7b
   
   # For better quality, use llama2:13b
   OLLAMA_MODEL=llama2:13b
   ```

2. **Resource Limits**:
   ```yaml
   # In docker-compose.yml
   services:
     ollama:
       deploy:
         resources:
           limits:
             memory: 6G
             cpus: '4.0'
   ```

3. **Swap Space** (if low RAM):
   ```bash
   # Add 4GB swap
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

## 📊 Monitoring & Maintenance

### Health Checks

1. **Automatic health check**:
   ```bash
   # Check if Ollama is responding
   curl -f http://your-server:11434/api/tags
   ```

2. **Log monitoring**:
   ```bash
   # View logs
   docker logs taskego-ollama -f
   
   # Check resource usage
   docker stats taskego-ollama
   ```

### Backup & Updates

1. **Model backup**:
   ```bash
   # Models are stored in Docker volume
   # Backup the volume
   docker run --rm -v ollama_data:/data -v $(pwd):/backup alpine tar czf /backup/ollama-models.tar.gz /data
   ```

2. **Update Ollama**:
   ```bash
   # Pull latest image
   docker pull ollama/ollama:latest
   
   # Restart container
   docker-compose down
   docker-compose up -d
   ```

## 🧪 Testing Your Deployment

### 1. Test Connection
```bash
# Test if Ollama is accessible
curl http://your-server:11434/api/tags
```

### 2. Test Model
```bash
# Test text generation
curl -X POST http://your-server:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2:7b",
    "prompt": "Hello, can you help me with Taskego services?",
    "stream": false
  }'
```

### 3. Test Taskego Integration
```bash
# Run the integration test
OLLAMA_BASE_URL=http://your-server:11434 node test-integration.js
```

## 🚨 Troubleshooting

### Common Issues

1. **Out of Memory**:
   ```bash
   # Check available memory
   free -h
   
   # Use smaller model
   OLLAMA_MODEL=llama2:7b
   
   # Add swap space
   sudo fallocate -l 4G /swapfile
   ```

2. **Slow Responses**:
   ```bash
   # Check CPU usage
   htop
   
   # Use smaller model
   OLLAMA_MODEL=llama2:7b
   
   # Check network latency
   ping your-server
   ```

3. **Connection Refused**:
   ```bash
   # Check if Ollama is running
   docker ps | grep ollama
   
   # Check logs
   docker logs taskego-ollama
   
   # Check port binding
   netstat -tlnp | grep 11434
   ```

### Performance Tuning

1. **Model Loading**:
   ```bash
   # Pre-load models for faster responses
   docker exec taskego-ollama ollama pull llama2:7b
   docker exec taskego-ollama ollama pull llama2:13b
   ```

2. **Response Caching**:
   ```bash
   # Enable response caching in your backend
   # Store common responses in Redis/Memory
   ```

## 💰 Cost Breakdown

### Monthly Costs (Estimated)

| Provider | Plan | RAM | Cost | Best For |
|----------|------|-----|------|----------|
| **DigitalOcean** | Basic | 8GB | $6/month | Production |
| **Linode** | Shared CPU | 8GB | $6/month | Production |
| **Vultr** | Cloud Compute | 8GB | $6/month | Production |
| **AWS EC2** | t3.medium | 4GB | $8/month | Enterprise |
| **Local** | Your PC | 8GB+ | $0/month | Development |

### Free Alternatives

1. **Local Development**: Run on your own machine
2. **AWS Free Tier**: 12 months free (1GB RAM)
3. **Google Cloud**: $300 credit for 90 days
4. **Azure**: $200 credit for 30 days

## 🎯 Next Steps

1. **Choose deployment option** based on your needs
2. **Deploy Ollama** using the scripts provided
3. **Test integration** with Taskego backend
4. **Monitor performance** and adjust as needed
5. **Scale up** when user base grows

## 📞 Support

If you encounter issues:
1. Check the logs: `docker logs taskego-ollama`
2. Verify Ollama is running: `curl http://your-server:11434/api/tags`
3. Test model directly: `ollama run llama2:7b "test"`
4. Check hardware resources: `htop`, `free -h`

---

**Remember**: Ollama is completely free and runs on your infrastructure. No API keys or external dependencies required!
