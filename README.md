# BanGround Cat

BanGround 群管机器人，有自动化加群验证、谱面转换等功能。

此机器人使用[koishi](https://koishi.js.org/)框架，所以它支持您自行扩展模块；同时，得益于该框架，您可以在多个平台上运行此应用，包括**QQ**、**Discord**、**开黑啦**和**Telegram**。

## 环境要求

推荐在 Windows 7 或更高 / Ubuntu 16 或更高 / CentOS 6 或更高的操作系统下运行。
  
运行环境：
  
- Node.js >= 12

## 首次调试运行或部署

首先，请确认您已经配置好了方便在终端使用`git`和`npm`命令的环境变量，以下默认您已经这样配置了。

1. 按照您的需求，配置好对应聊天平台的环境。

   [配置指导](https://koishi.js.org/guide/starter.html#%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C)

2. 克隆本仓库到本地。
   ```shell script
   git clone https://github.com/Kirakira-Games/BanGround-Cat.git
   ```
   当然，并非必须克隆仓库才能使用，直接下载源代码运行也是可以的——不过克隆仓库有很多好处，就不提了。
   
3. 在终端中切换到项目根目录。
   ```shell script
   cd BanGround-Cat
   ```
   
4. 运行安装命令。
   ```shell script
   npm i
   ```
   
5. 将`data`目录下的`config.json.template`复制一份到`config.json`。
   ```shell script
   cp ./data/config.json.template ./data/config.json
   ```
   
6. 编辑`config.json`，按照需求编写配置文件。

   * QQ
     
     模板中默认启用的就是`onebot:ws`连接器的配置，您可以稍微花一点心思理解这些配置的意思。
     
     或者，查看[go-cqhttp参考](https://koishi.js.org/api/adapter/onebot.html#go-cqhttp-%E9%85%8D%E7%BD%AE%E5%8F%82%E8%80%83)也是可以的，不过要注意要写成json。

   * Discord / Telegram / 开黑啦
   
     `Discord`/`Telegram`/`开黑啦`连接器的配置很简单，您可以直接套用下面的模板：
     ```json
     {
       "type": "adapterType",
       "token": "YourDiscordBotToken"
     }
     ```
     `Discord`连接器的`type`为`discord`；`Telegram`连接器的`type`为`telegram`；`开黑啦`连接器的`type`为`kaiheila`。
     
     *如果您需要更详细的配置方法，如修改连接到的地址，请在[koishi官网](https://koishi.js.org/api/)查看对应连接器的帮助。*

## 调试运行

项目已经为您配置了`concurrently`+`nodemon`的热更新模块，您可以直接在终端中使用相应脚本运行之：
```shell script
npm run dev
```
这样，在您对源代码做出更改时，程序会自动重新启动。

*提示：有时（尤其是第一次）该脚本会卡死，不能正常启动。此时只需要在终端中终止脚本，然后重启启用脚本即可解决。*

## 部署

项目已经为您配置了运行脚本，您可以直接在终端中使用相应脚本运行之：
```shell script
npm run start
```
这样，程序就会启动了。

如果您需要停止程序，您可以在终端中使用`Ctrl+C`的组合键终止之。
