# edgeproxy

在 Cloudflare Workers/Pages 运行 VLESS 代理

## 部署

### Pages 部署方法

1. 在 [Release 页面](https://github.com/wkmz/edgeproxy/releases) 下载 `worker.zip` 文件。
2. 在 Cloudflare Pages 上传下载的文件。
3. 设置环境变量。
4. 重新上传文件使环境变量生效。
5. 访问 `https://<你的 Pages 网站域名>/<设置的 UUID>` 获取分享链接。

### Workers 部署方法

1. 在 [Release 页面](https://github.com/wkmz/edgeproxy/releases) 下载 `worker.zip` 文件。
2. 在 Cloudflare Worker 控制台中创建一个新的 Worker。
3. 将 `worker.zip` 内的 `_worker.js` 文件的内容粘贴到 Worker 编辑器中。
4. 设置环境变量
5. 访问 `https://<你的 Workers 网站域名>/<设置的 UUID>` 获取分享链接。

## 环境变量

| 变量名   | 示例                                 | 说明                                       |
| -------- | ------------------------------------ | ------------------------------------------ |
| UUID     | 6a4220d2-cefd-40b5-9749-d2c049444fc8 | 可设置多个 UUID，分隔符为英文逗号：`,`     |
| PROXY_IP | 152.70.155.147:2053                  | 可设置多个代理 IP，同样以英文逗号分隔：`,` |
