# 项目构成说明

> 关键文件

+ `get_hots.py`为独立的爬虫程序，与`django`完全无关。用于爬取并存储热搜数据，同时负责数据库的定时清理

+ `/hot/databaseSetting.py`为数据库配置文件，`django`与`get_hots.py`均依赖于此文件的数据库配置

+ 静态资源服务器采用`Nginx`，所以没有在`django`中配置静态资源服务


> 运行

`python manage.py runserver`
