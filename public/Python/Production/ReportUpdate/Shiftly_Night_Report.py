import os
from pathlib import Path
import numpy as np
import mysql.connector
from datetime import datetime
from sqlalchemy import create_engine
import pandas as pd

hostname='pbvweb01v'
engine = create_engine('mysql+mysqlconnector://root:123456@pbvweb01v:3306/pr2k', echo=False)
def get_this_week():
    week_str=''
    week=1+int(datetime.now().strftime("%W"))
    if week<10:
        week_str='W0'+str(week)
    else:
        week_str='W'+str(week)
    return week_str

def get_date_format(date):
    year=date[0:4]
    month=date[5:7]
    day=date[8:10]
    return year+month+day

today=datetime.now().strftime('%Y-%m-%d')
date=get_date_format(today)
# today = '2020-05-21'#datetime.now().strftime('%Y-%m-%d')
# date  = '20200521'#get_date_format(today)

#sql=('SELECT LEFT(FILE,6) AS GroupLine, COUNT(FILE) as Error_File FROM bundleticket_error '
#     +'WHERE DATE="'+date+'" AND TimeUpdate<="'+today+' 14:20:00" AND TimeUpdate>="'+today+' 05:00:00" '
#     +'GROUP BY LEFT(FILE,6);')
#bundleErrorGroup=pd.read_sql(sql, engine)

sql=('SELECT LEFT(FILE,6) AS GroupLine, COUNT(FILE) as Error_File FROM bundleticket_error '
     +'WHERE DATE="'+date+'" AND TimeUpdate<="'+today+' 22:35:00" AND TimeUpdate>="'+today+' 14:15:00" '
     +'GROUP BY LEFT(FILE,6);')
bundleErrorGroup=pd.read_sql(sql, engine)

sql=('SELECT COUNT(BUNDLE) as COUNT_BUNDLE, QC, sum(IS_FULL) as SUM_FULL, COUNT(DISTINCT MODIFIED) as MODIFIED, '
     +' LEFT(FILE, 6) AS LINE, MID(FILE, 20,4) as TIME, FILE '
     +' FROM employee_scanticket '
     +' Where DATE="'+date+'" AND TimeUpdate<="'+today+' 22:35:00" AND TimeUpdate>="'+today+' 14:15:00" '
     +' GROUP BY FILE;')
imageFile=pd.read_sql(sql, engine)

row=0
imageFile_len=len(imageFile)
group_dict   = []
group_list   = []
noQC_list    = []
noID_list    = []
modified_list= []
wip_list     = []
done_list    = []
err_list     = []
sum_list     = []
while row<imageFile_len:
    group=imageFile.iloc[row, 4]
    group_data=imageFile.query('LINE=="'+group+'"')
    no_QC    = 0
    no_ID    = 0
    modified = 0
    wip      = 0
    done     = 0
    err      = 0
    total    = 0
    for i in range(0, len(group_data)):
        SUM_BUNDLE=group_data.iloc[i,0]
        QC=group_data.iloc[i, 1]
        SUM_FULL=group_data.iloc[i, 2]
        MODIFIED_USER=group_data.iloc[i, 3]
        if (group_data.iloc[i,5]).isdigit():
            TIME=int(group_data.iloc[i,5])
        else:
            TIME=2100
        if QC=='' and TIME<2155:#1320
            no_QC=no_QC+1
        if SUM_FULL==0 and TIME<2155:
            no_ID=no_ID+1
        if MODIFIED_USER==2:
            modified=modified+1
        if QC=='' and TIME>=2155 and TIME<2235:#1320, 1415
            wip=wip+1
        done=done+1
    for i in range(0, len(bundleErrorGroup)):
        if group==bundleErrorGroup.iloc[i,0]:
            err=bundleErrorGroup.iloc[i,1]
            break
    total=done+err
    group_list.append(group)
    done_list.append(done-no_QC-no_ID-modified-wip)
    noQC_list.append(no_QC)
    noID_list.append(no_ID)
    modified_list.append(modified)
    wip_list.append(wip)       
    err_list.append(err)
    sum_list.append(total)
#    group_dict.append({'group':group, 'no_QC': no_QC, 'no_ID': no_ID, 'modified': modified, 'done': done, 'wip':wip, 'err':err})
    row=row+len(group_data)
    # print(row)
group_list.append('Tổng ảnh')
group_list.append('Tỉ lệ (%)')
done_sum=sum(done_list)
noQC_sum=sum(noQC_list)
noID_sum=sum(noID_list)
modified_sum=sum(modified_list)
wip_sum=sum(wip_list)
err_sum=sum(err_list)
total=done_sum+noQC_sum+noID_sum+modified_sum+wip_sum+err_sum
if total!=0:
    done_list.append(done_sum)
    done_list.append(round(done_sum/total*100,2))
    noQC_list.append(noQC_sum)
    noQC_list.append(round(noQC_sum/total*100,2))
    noID_list.append(noID_sum)
    noID_list.append(round(noID_sum/total*100,2))
    modified_list.append(modified_sum)
    modified_list.append(round(modified_sum/total*100,2))
    wip_list.append(wip_sum)
    wip_list.append(round(wip_sum/total*100,2))
    err_list.append(err_sum)
    err_list.append(round(err_sum/total*100,2))
    sum_list.append(sum(sum_list))
    sum_list.append(100)
else:
    done_list.append(done_sum)
    done_list.append(0)
    noQC_list.append(noQC_sum)
    noQC_list.append(0)
    noID_list.append(noID_sum)
    noID_list.append(0)
    modified_list.append(modified_sum)
    modified_list.append(0)
    wip_list.append(wip_sum)
    wip_list.append(0)
    err_list.append(err_sum)
    err_list.append(0)
    sum_list.append(sum(sum_list))
    sum_list.append(100)
KickOutReport=pd.DataFrame(
        {
                'GROUP': group_list,
                'DA_SCAN': done_list,
                'THIEU_QC': noQC_list,
                'THIEU_ID_NV': noID_list,
                'DA_CHINH_SUA': modified_list,
                'WIP': wip_list,
                'LOI_ANH': err_list,
                'TONG': sum_list
        }
    )

bundleError_link='\\\\pbvfps1\\PBShare2\\Scan\\Report\\KickOut\\'
thisWeek=get_this_week()
#=====Done Paper===========================
if not os.path.exists(bundleError_link+thisWeek):
    os.makedirs(bundleError_link+thisWeek)
writer = pd.ExcelWriter(bundleError_link+thisWeek+'\\KickOut_'+date+'_Night.xlsx', engine='xlsxwriter')
#KickOutReport.to_excel('KickOut.xlsx', index=False)
KickOutReport.to_excel(writer, sheet_name='Kick Out Report', index=False)
imageFile.to_excel(writer, sheet_name='Detail', index=False)
bundleErrorGroup.to_excel(writer, sheet_name='Error Page', index=False)
writer.save()


#=====Daily Bundle==========================
dailyBundle_link='\\\\pbvfps1\\PBShare2\\Scan\\Report\\DailyBundle\\'
thisWeek=get_this_week()
if not os.path.exists(dailyBundle_link+thisWeek):
    os.makedirs(dailyBundle_link+thisWeek)
dailyBundle=pd.read_sql('select * from employee_scanticket where DATE="'+date+'";', engine)
# writer = pd.ExcelWriter(, engine='xlsxwriter')
dailyBundle.to_excel(dailyBundle_link+thisWeek+'\\DailyBundle_'+date+'.xlsx', index=False)
engine.dispose()