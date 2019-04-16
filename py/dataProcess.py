#encoding=utf-8
import json
infoFile = open("../src/网吧信息.csv","r",encoding='utf-8')
recordFile0 = open("../src/hydata_swjl_0.csv","r",encoding='utf-8')
recordFile1 = open("../src/hydata_swjl_1.csv","r",encoding='utf-8')



recordData = {}
for line in recordFile0:
    line = line.replace('\n','')
    line = line.replace('"','')
    ls = line.split(',')
    if recordData.__contains__(ls[1]):
        recordData[ls[1]]["value"] += 1
    else:
        recordData[ls[1]] = {
            "value": 1
        }



for line in recordFile1:
    line = line.replace('\n', '')
    line = line.replace('"', '')
    ls = line.split(',')
    if recordData.__contains__(ls[1]):
        recordData[ls[1]]["value"] += 1
    else:
        recordData[ls[1]] = {
            "value": 1
        }
recordFile1.close()
recordFile0.close()



geoData = {}
for line in infoFile:
    line = line.replace('\n','')
    line = line.replace('）','')
    ls = line.split(',')
    # SITEID , NAME , LNG , LAT
    geoData[ls[0]] = {
        "name":ls[1],
        "lng":ls[2],
        "lat":ls[3]
    }

delData = []
for k,v in recordData.items():
    if geoData.__contains__(k):
        v["name"] = geoData[k]["name"]
        v["lng"] = geoData[k]["lng"]
        v["lat"] = geoData[k]["lat"]
    else:
        delData.append(k)

for i in delData:
    del recordData[i]

fw = open("dataProcessed.json","w",encoding="utf-8")
json.dump(recordData, fw, indent=4, ensure_ascii=False)
print(recordData)







