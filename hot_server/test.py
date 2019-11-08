import requests
from bs4 import BeautifulSoup

url = "https://www.zhihu.com/billboard"
headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'}
bs = BeautifulSoup(requests.get(url, headers=headers).content,'html.parser')
rank_list = bs.select(".HotList-itemBody")
hots = [(item.contents[0].text, int(item.contents[1].text[:-3])) for item in rank_list]
print(hots)