# Create your views here.
import json,datetime
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods
from data.models import SinaHot,ZhihuHot,BilibiliHot

class RestResponse:
    # 表示是否请求成功
    success:bool = True
    # 承载的数据
    data = None
    # 消息
    message:str = ''

    def format(self):
        return {
            "success":self.success,
            "data":self.data,
            "message":self.message
        }

def format_dicts(objs):
    obj_arr=[]
    for o in objs:
        obj_arr.append(o.format())
    return obj_arr


@require_http_methods(['GET'])
def sina(request:HttpRequest):
    """
    返回指定时间段内的微博热搜数据
    :param request:
    :return:
    """
    response = RestResponse()
    params = request.GET
    start_date = float(params.get('start_date')) # 开始时间的时间戳
    end_date = float(params.get('end_date')) # 结束时间的时间戳
    response.data = format_dicts(SinaHot.objects.filter(date_time__range=[datetime.datetime.fromtimestamp(start_date),datetime.datetime.fromtimestamp(end_date)]).all())
    # response.data = SinaHot.objects.get(id=5000).format()
    return JsonResponse(response.format())

@require_http_methods(['GET'])
def zhihu(request:HttpRequest):
    """
    返回指定时间段内的知乎热搜数据
    :param request:
    :return:
    """
    response = RestResponse()
    params = request.GET
    start_date = float(params.get('start_date')) # 开始时间的时间戳
    end_date = float(params.get('end_date')) # 结束时间的时间戳
    response.data = format_dicts(ZhihuHot.objects.filter(date_time__range=[datetime.datetime.fromtimestamp(start_date),datetime.datetime.fromtimestamp(end_date)]).all())
    return JsonResponse(response.format())

@require_http_methods(['GET'])
def bilibili(request:HttpRequest):
    """
    返回指定时间段内的sina热搜数据
    :param request:
    :return:
    """
    response = RestResponse()
    params = request.GET
    start_date = float(params.get('start_date')) # 开始时间的时间戳
    end_date = float(params.get('end_date')) # 结束时间的时间戳
    response.data = format_dicts(BilibiliHot.objects.filter(date_time__range=[datetime.datetime.fromtimestamp(start_date),datetime.datetime.fromtimestamp(end_date)]).all())
    return JsonResponse(response.format())