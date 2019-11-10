import requests
import sqlalchemy
import datetime
from bs4 import BeautifulSoup
from sqlalchemy.ext.declarative import declarative_base
from apscheduler.schedulers.blocking import BlockingScheduler
from hot.databaseSetting import DatabaseSettings
from string import Template
# 创建链接
engine = sqlalchemy.create_engine("mysql+pymysql://{username}:{password}@{host}:{port}/{database}".format(username = DatabaseSettings.username, password=DatabaseSettings.password, host=DatabaseSettings.host, port=DatabaseSettings.port, database = DatabaseSettings.database), encoding ="utf-8", echo = True)
# 生成orm基类
base = declarative_base()

class SinaHot(base):
  __tablename__ = "HOT_SEARCH"
  id = sqlalchemy.Column(sqlalchemy.INTEGER,primary_key = True)
  date_time = sqlalchemy.Column(sqlalchemy.DATETIME)
  title = sqlalchemy.Column(sqlalchemy.String(66))
  rate = sqlalchemy.Column(sqlalchemy.INTEGER)

class ZhihuHot(base):
  __tablename__ = "HOT_SEARCH_ZHIHU"
  id = sqlalchemy.Column(sqlalchemy.INTEGER, primary_key=True)
  date_time = sqlalchemy.Column(sqlalchemy.DATETIME)
  title = sqlalchemy.Column(sqlalchemy.String(66))
  rate = sqlalchemy.Column(sqlalchemy.INTEGER)

class BilibiliHot(base):
  __tablename__ = "HOT_SEARCH_BILIBILI"
  id = sqlalchemy.Column(sqlalchemy.INTEGER, primary_key=True)
  date_time = sqlalchemy.Column(sqlalchemy.DATETIME)
  title = sqlalchemy.Column(sqlalchemy.String(66))
  rate = sqlalchemy.Column(sqlalchemy.INTEGER)

# 创建表结构
base.metadata.create_all(engine)
DBSession = sqlalchemy.orm.sessionmaker(bind = engine)



headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'}

"""
  爬取微博热搜
"""
def sina_task():
  session = DBSession()
  url = "https://s.weibo.com/top/summary?Refer=top_hot&topnav=1&wvr=6"
  bs = BeautifulSoup(requests.get(url=url, headers=headers).content, "html.parser")
  rank_list = bs.findAll("tr")[2:]
  hots = [(item.a.text,item.span.text) for item in rank_list]
  date_time = datetime.datetime.now()
  for item in hots:
    hot_obj = SinaHot(date_time = date_time, title=item[0], rate=item[1])
    session.add(hot_obj)
  session.commit()
  session.close()



"""
  爬取zhihu热搜
"""
def zhihu_task():
  session = DBSession()
  url = "https://www.zhihu.com/billboard"
  bs = BeautifulSoup(requests.get(url, headers=headers).content, 'html.parser')
  rank_list = bs.select(".HotList-itemBody")
  hots = [(item.contents[0].text, int(item.contents[1].text[:-3])) for item in rank_list]
  date_time = datetime.datetime.now()
  for item in hots:
    hot_obj = ZhihuHot(date_time=date_time,title=item[0],rate=item[1])
    session.add(hot_obj)
  session.commit()
  session.close()


"""
  爬取bilibili热榜
"""
def bilibili_task():
  session = DBSession()
  url = "https://api.bilibili.com/x/web-interface/ranking?rid=0&day=1&type=1&arc_type=0"
  rank_list = requests.get(url,headers=headers).json()["data"]["list"]
  hots = [(item.title,item.pts) for item in rank_list]
  date_time = datetime.datetime.now()
  for item in hots:
    hot_obj = BilibiliHot(date_time=date_time,title=item[0],rate=item[1])
    session.add(hot_obj)
  session.commit()
  session.close()

"""
  清理数据
"""
def database_task():
  session = DBSession()
  now = datetime.datetime.now()
  delta = datetime.timedelta(days=30)
  start = now - delta
  limit_date = start.strftime("%Y-%m-%d %H:%M:%S")
  # 删除数据
  session.query(SinaHot).filter(SinaHot.date_time < limit_date).delete(synchronize_session=False)
  session.query(ZhihuHot).filter(ZhihuHot.date_time < limit_date).delete(synchronize_session=False)
  # B站数据很少，不进行清理
  # session.query(BilibiliHot).filter(BilibiliHot.date_time < limit_date).delete(synchronize_session=False)
  session.commit()
  session.close()

if __name__ == '__main__':
    scheduler = BlockingScheduler()
    scheduler.add_job(sina_task,'cron',minute="*/5")
    scheduler.add_job(zhihu_task,"cron",minute="*/5")
    # b站的榜单每天更新一次
    scheduler.add_job(bilibili_task,"cron",day="*/1")

    scheduler.add_job(database_task,"cron",day="*/1",hour="23")
    scheduler.start()