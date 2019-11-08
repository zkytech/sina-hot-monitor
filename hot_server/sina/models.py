from django.db import models

class SinaHot(models.Model):
    id = models.AutoField(primary_key=True)
    # 时间
    date_time = models.DateTimeField()
    # 热搜标题
    title = models.CharField(max_length=66)
    # 热度
    rate = models.IntegerField()

    def format(self):
        return {
            "id":self.id,
            "date_time":self.date_time.timestamp() * 1000,
            "title":self.title,
            "rate":self.rate
        }

    class Meta:
        #table name
        db_table = 'HOT_SEARCH'


class ZhihuHot(models.Model):
    id = models.AutoField(primary_key=True)
    # 时间
    date_time = models.DateTimeField()
    # 热搜标题
    title = models.CharField(max_length=66)
    # 热度
    rate = models.IntegerField()

    def format(self):
        return {
            "id": self.id,
            "date_time": self.date_time.timestamp() * 1000,
            "title": self.title,
            "rate": self.rate
        }

    class Meta:
        # table name
        db_table = 'HOT_SEARCH_ZHIHU'