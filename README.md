# 人工智能对就业影响监测预警系统

Vue 单页应用，部署于 https://www.sh-ai-trend.com/robot-industry/ 。原有页面文字、图表数据、知识图谱、Excel、2018–2024 年 PDF 和专业问答提示词保持不变。

## 运行环境与版本

2026-10-11 已核对 npm 官方 registry 的 latest 稳定版本：Vue 3.5.43、Vue Router 5.4.0、ECharts 6.1.0、View UI Plus 1.3.24、markdown-it 15.0.2、Vite 8.3.4、Vue 插件 6.0.10、Vue DevTools 插件 8.2.1。版本在 package.json 和 lockfile 中锁定。

生产 API 使用 Node.js 24.21.0（当日最新 24 LTS），只依赖 Node 内置模块。ECharts 使用官方 v5 兼容主题保留原样式。开发工具仅在开发模式启用，页面按路由延迟加载。

DeepSeek 官方 V4.1 Flash 的 API 标识是 `deepseek-flash`，接口为 `https://api.deepseek.com/chat/completions`。使用非思考模式保持原有快速问答行为。

官方参考：

- https://api-docs.deepseek.com/news/news260910/
- https://router.vuejs.org/guide/migration/v4-to-v5
- https://echarts.apache.org/handbook/zh/basics/release-note/v6-upgrade-guide/
- https://vite.dev/guide/migration
- https://nodejs.org/dist/v24.21.0/

## 本地开发

安装 Node.js 24 LTS，执行：

```sh
npm ci
cp .env.example .env
# 在 .env 中设置有效的 DEEPSEEK_API_KEY
npm start
```

另开终端执行 `npm run dev`，访问 http://localhost:5173/robot-industry/ 。Vite 将 `/robot-industry/api/` 代理到本机 3001 端口。不要把密钥放在 `VITE_` 变量中；这种变量会被打包给浏览器。

## 验证与构建

```sh
npm run check
npm audit
npm outdated
```

自动化检查涵盖真实 HTTP 请求、输入校验、模型及专业提示词固定、上游错误脱敏、限流、并发限制、超时，以及原有内容的指纹校验。内容基线为仓库提交 `07642f1`。更新历史数据或提示词前，需要明确授权并有意识地更新对应校验。

## 阿里云部署

静态文件为 `dist/`，API 程序与原提示词位于 `server/`。生产部署采用独立系统用户、systemd 服务和只监听回环地址的 API，不需要安装生产 npm 依赖。

目录约定：

- `/opt/robot-industry/releases/<release>/`：代码及 dist，保留旧版本便于回滚。
- `/opt/robot-industry/current`：当前版本软链接。
- `/opt/robot-industry/runtime`：Node.js 24 LTS 二进制目录软链接。
- `/var/www/robot-industry`：当前版本 dist 软链接。
- `/etc/robot-industry/api.env`：仅 root 可读的服务端密钥配置，不会进 Git。
- `/root/robot-industry-backups/`：发布前备份，仅 root 可访问。

将 `deploy/robot-industry-api.service` 安装为 `/etc/systemd/system/robot-industry-api.service`，创建 `robot-industry` 系统用户，然后启动服务：

```sh
systemctl daemon-reload
systemctl enable --now robot-industry-api
```

准备好 release 目录、runtime 软链接和私有 api.env 后，也可用 `bash deploy/install-release.sh /opt/robot-industry/releases/<release>` 完成有备份和失败回滚的安装。脚本会检查 API 健康状态及 Nginx 配置，并切换静态站软链接。

参考 `deploy/nginx-api.conf.example`，在现有 HTTPS server 内添加 API 反向代理，保留原 SSL 证书路径和站点域名。发布前备份现有静态文件和 Nginx 配置，先执行 `nginx -t`，通过后再 reload。

```sh
curl https://www.sh-ai-trend.com/robot-industry/api/health
```

预期返回 `status: ok`、`model: deepseek-flash`。随后在网站“行业大模型问答”里实测一次。

后端固定原专业提示词、模型、2048 输出 token 上限和 temperature=0.6。每个地址每分钟最多 10 次问答，全局最多 4 个并发请求；单个问题最多 4000 字符。只允许配置中的浏览器来源，但公共网站不提供用户认证，来源检查不能替代认证；限流用于控制公开接口的资源消耗。

## 密钥与回滚

旧版将 DeepSeek 密钥放在公开 JavaScript 中。升级后密钥仅存在服务器环境配置中，但历史泄露的旧密钥仍应在 DeepSeek 后台撤销并换新，再更新 `/etc/robot-industry/api.env` 并重启 API。备份不得复制进公开静态目录。

更换 release 时先切换 `current`，重启 API 并检查 health，再原子切换静态站软链接。前一次版本及 Nginx 配置应一直保留；初次升级的原始站点位于发布前备份中。证书由 certbot 定时续期，成功后执行 Nginx reload。
