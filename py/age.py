#encoding=utf-8
import json
import math
import time
file1 = open("../src/hydata_swjl_0.csv","r",encoding="utf-8")
file2 = open("../src/hydata_swjl_1.csv","r",encoding="utf-8")




all = []
for line in file1:
    line = line.replace('\n', '')
    line = line.replace('"', '')
    info = line.split(',')
    all.append(info)
for line in file2:
    line = line.replace('\n', '')
    line = line.replace('"', '')
    info = line.split(',')
    all.append(info)

def getAge(t1, t2):
    age = t2.tm_year - t1.tm_year
    if t2.tm_mon < t1.tm_mon or t2.tm_mon == t1.tm_mon and t2.tm_mday < t1.tm_mday:
        age -= 1
    return age

#18-25 26-33 34-42 43
date = 2016
data = {}

ageStep = [18, 26, 34, 43]

# 本市 ，外来人口
count18 = [0,0]
count26 = [0,0]
count34 = [0,0]
count43 = [0,0]
countMax = [0,0]

for line in all:
    info = line
    birthday = info[-1]
    onlineday = info[4]


    try:
        areaID = eval(info[6][0:2])
    except Exception as e:
        print(e)

    # print(areaID[0:2])
    try:
        birthday = time.strptime(birthday,"%Y%m%d")
        onlineday = time.strptime(onlineday,"%Y%m%d%H%M%S")
        age = getAge(birthday, onlineday)
        SITEINFO = data.get(info[1], [[0,0], [0,0], [0,0], [0,0], [0,0]])


        if age < ageStep[0]:
            if areaID == 51:
                count18[0] += 1
                SITEINFO[0][0] += 1
            else:
                count18[1] += 1
                SITEINFO[0][1] += 1
        elif age < ageStep[1]:
            if areaID == 51:
                count26[0] += 1
                SITEINFO[1][0] += 1
            else:
                count26[1] += 1
                SITEINFO[1][1] += 1
        elif age < ageStep[2]:
            if areaID == 51:
                count34[0] += 1
                SITEINFO[2][0] += 1
            else:
                count34[1] += 1
                SITEINFO[2][1] += 1
        elif age < ageStep[3]:
            if areaID == 51:
                count43[0] += 1
                SITEINFO[3][0] += 1
            else:
                count43[1] += 1
                SITEINFO[3][1] += 1
        else:
            if areaID == 51:
                countMax[0] += 1
                SITEINFO[4][0] += 1
            else:
                countMax[1] += 1
                SITEINFO[4][1] += 1

        data['all'] = [count18,count26,count34,count43,countMax]

        data[info[1]] = SITEINFO

    except Exception as e:
        print(end='')

fw = open("age.json","w",encoding="utf-8")
json.dump(data, fw, ensure_ascii=False, indent=4)



