// 引入必要的模块
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// 配置中间件
app.use(bodyParser.json()); // 解析JSON请求体
app.use(express.static(__dirname)); // 托管静态文件（HTML/CSS/JS）

// 存储搭子信息的数组（内存存储，重启服务会清空）
let partnerList = [];

// 接口1：接收发布的搭子信息
app.post('/api/submit-partner', (req, res) => {
    try {
        const { username, identity, purpose, time, city, requirement, contact } = req.body;
        
        // 创建新的搭子信息对象（identity=学校，purpose=目的地）
        const newPartner = {
            id: Date.now(), // 唯一ID（时间戳）
            username,
            identity, // 存储学校信息
            purpose,  // 存储目的地信息
            time,     // 存储时间信息
            city,     // 存储所在城市
            requirement,
            contact,
            createTime: new Date().toLocaleString() // 发布时间
        };

        // 添加到数组
        partnerList.push(newPartner);
        
        // 返回成功响应
        res.json({
            code: 200,
            msg: '搭子信息发布成功',
            data: newPartner
        });
    } catch (error) {
        // 异常处理
        res.json({
            code: 500,
            msg: '服务器错误：' + error.message
        });
    }
});

// 接口2：获取搭子列表（支持学校、目的地、时间筛选）
app.get('/api/get-partners', (req, res) => {
    try {
        let filteredPartners = [...partnerList]; // 复制数组避免原数据被修改
        
        // 1. 按目的（目的地）筛选
        if (req.query.purpose && req.query.purpose !== '全部') {
            filteredPartners = filteredPartners.filter(item => item.purpose === req.query.purpose);
        }
        
        // 2. 按城市筛选（模糊匹配）
        if (req.query.city && req.query.city.trim()) {
            const cityKeyword = req.query.city.trim();
            filteredPartners = filteredPartners.filter(item => 
                item.city.includes(cityKeyword)
            );
        }

        // 3. 新增：按学校筛选（模糊匹配，identity字段存学校）
        if (req.query.school && req.query.school.trim()) {
            const schoolKeyword = req.query.school.trim();
            filteredPartners = filteredPartners.filter(item => 
                item.identity.includes(schoolKeyword)
            );
        }

        // 4. 新增：按目的地筛选（模糊匹配，purpose字段存目的地）
        if (req.query.destination && req.query.destination.trim()) {
            const destKeyword = req.query.destination.trim();
            filteredPartners = filteredPartners.filter(item => 
                item.purpose.includes(destKeyword)
            );
        }

        // 5. 新增：按时间筛选（模糊匹配）
        if (req.query.time && req.query.time.trim()) {
            const timeKeyword = req.query.time.trim();
            filteredPartners = filteredPartners.filter(item => 
                item.time.includes(timeKeyword)
            );
        }

        // 返回筛选后的列表
        res.json({
            code: 200,
            data: filteredPartners
        });
    } catch (error) {
        res.json({
            code: 500,
            msg: '获取列表失败：' + error.message,
            data: []
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ 服务已启动：http://localhost:${PORT}`);
    console.log(`📂 静态文件目录：${__dirname}`);
});