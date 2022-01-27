import os
from pathlib import Path
import numpy as np
import mysql.connector
from datetime import datetime, timedelta
from sqlalchemy import create_engine
import pandas as pd
import openpyxl , sys

hostname='pbvweb01v'
engine = create_engine('mysql+mysqlconnector://root:123456@pbvweb01v:3306/linebalancing', echo=False)
engine = create_engine('mysql+mysqlconnector://root:123456@pbvweb01v:3306/linebalancing', echo=False)

def get_date_format(date):
    year=date[0:4]
    month=date[5:7]
    day=date[8:10]
    return year+month+day

if __name__ == "__main__":
    sewing_pd=pd.DataFrame()
    mover_new=pd.DataFrame()
    mover_old=pd.DataFrame()
    cutting_pd=pd.DataFrame()
    incentive_json=[]
    datefrom = sys.argv[2]+' 23:59:59'
    dateto   = sys.argv[1]+' 00:00:00'
    datetime_datefrom = datetime.strptime(datefrom, '%Y-%m-%d %H:%M:%S')
    datetime_dateto   = datetime.strptime(dateto,   '%Y-%m-%d %H:%M:%S')
    datespan          = (datetime_datefrom-datetime_dateto).days+1
    for i in range(0, datespan):
        datetime_object = datetime.strptime(datefrom, '%Y-%m-%d %H:%M:%S')
        lastdate = datetime_object-timedelta(days=i)
        lastdate_str = lastdate.strftime('%Y-%m-%d %H:%M:%S')
        date_str = get_date_format(lastdate_str)
        query=('SELECT Temp1.DATE, setup_emplist.ID, Temp1.SUM_BUNDLE, Temp1.SAH, Temp1.INCENTIVE, setup_emplist.TYPE '
            +' FROM erpsystem.setup_emplist setup_emplist INNER JOIN '
            +' (SELECT pr2k.employee_scanticket.DATE, pr2k.employee_scanticket.EMPLOYEE, '
            +' COUNT(pr2k.employee_scanticket.TICKET) AS SUM_BUNDLE, ROUND(SUM(pr2k.employee_scanticket.EARNED_HOURS)/60, 2) AS SAH,  ROUND(SUM(pr2k.employee_scanticket.EARNED_HOURS)/60, 2)*6000 AS INCENTIVE '
            +' FROM pr2k.employee_scanticket '
            +' WHERE pr2k.employee_scanticket.DATE="'+date_str+'" and EARNED_HOURS is not null'
            +' GROUP BY pr2k.employee_scanticket.EMPLOYEE) AS Temp1 '
            +' ON RIGHT(setup_emplist.ID, 5)=Temp1.EMPLOYEE;')
        data=pd.read_sql(query, engine)
        sewing_pd=sewing_pd.append(data)
        
    for i in range(0, datespan):
        datetime_object = datetime.strptime(datefrom, '%Y-%m-%d %H:%M:%S')
        lastdate = datetime_object-timedelta(days=i)
        lastdate_str = lastdate.strftime('%Y-%m-%d %H:%M:%S')
        date_str = get_date_format(lastdate_str)
        query=('SELECT t1.DATE, t1.EMPLOYEE, t1.SUM_BUNDLE, t1.SAH, t1.INCENTIVE, ep.TYPE FROM '
            +' (SELECT DATE_FORMAT("'+date_str+'","%Y%m%d") AS DATE, IDemployees AS EMPLOYEE, SUM(DzCase) AS SUM_BUNDLE, '
            +' ROUND(SUM(DzCase)*SAH,2) AS SAH, ROUND(SUM(DzCase)*SAH,2)*6000 AS INCENTIVE '
            +' FROM erpsystem.data_finishedgoodssewing actual INNER JOIN erpsystem.setup_sahmover mover '
            +' ON actual.ZoneMover=mover.AREA '
            +' WHERE DATE_FORMAT(DATE,"%Y%m%d")="'+date_str+'" GROUP BY IDEmployees, ZoneMover) t1 inner JOIN erpsystem.setup_emplist ep '
            +' ON t1.EMPLOYEE=ep.ID;')
        data=pd.read_sql(query, engine)
        mover_new=mover_new.append(data)

    for i in range(0, datespan):
        datetime_object = datetime.strptime(datefrom, '%Y-%m-%d %H:%M:%S')
        lastdate = datetime_object-timedelta(days=i)
        lastdate2 = datetime_object-timedelta(days=i-1)
        lastdate_str = lastdate.strftime('%Y-%m-%d')
        lastdate_str2 = lastdate2.strftime('%Y-%m-%d')
        date_str = get_date_format(lastdate_str)
        query=('select DATE, s.ID EMPLOYEE, SUM_BUNDLE, SAH, INCENTIVE, TYPE from '
            +' (SELECT DATE_FORMAT(DATE(e.TimeUpdate),"%Y%m%d") AS DATE, EMPLOYEE, COUNT(a.TICKET) SUM_BUNDLE, ROUND(SUM(a.EARNED_HOURS+a.SAH_ADJ),2) SAH, ROUND(SUM(a.EARNED_HOURS+a.SAH_ADJ),2)*6000 INCENTIVE FROM cutting_system.employee_scanticket e '
            +' INNER JOIN cutting_system.bundleticket_active a ON e.TICKET=a.TICKET '
            +' WHERE e.TimeUpdate>="'+lastdate_str+' 06:00:00" AND e.TimeUpdate<="'+lastdate_str2+' 06:00:00" GROUP BY EMPLOYEE) t1 inner join erpsystem.setup_emplist s '
            +' ON RIGHT(s.ID, 5)=t1.EMPLOYEE;')
        data=pd.read_sql(query, engine)
        cutting_pd=cutting_pd.append(data)
        
    for i in range(0, len(sewing_pd)):
        date       = sewing_pd.iloc[i, 0]
        employee   = sewing_pd.iloc[i, 1]
        sum_bundle = sewing_pd.iloc[i, 2]
        sah        = sewing_pd.iloc[i, 3]
        incentive  = sewing_pd.iloc[i, 4]
        type_emp   = sewing_pd.iloc[i, 5]
        incentive_json.append({'DATE':date, 'EMPLOYEE': employee, 'SUM_BUNDLE': sum_bundle, 'SAH': sah, 'INCENTIVE': incentive, 'TYPE': type_emp})
    for i in range(0, len(mover_new)):
        date       = mover_new.iloc[i, 0]
        employee   = mover_new.iloc[i, 1]
        sum_bundle = mover_new.iloc[i, 2]
        sah        = mover_new.iloc[i, 3]
        incentive  = mover_new.iloc[i, 4]
        type_emp   = mover_new.iloc[i, 5]
        incentive_json.append({'DATE':date, 'EMPLOYEE': employee, 'SUM_BUNDLE': sum_bundle, 'SAH': sah, 'INCENTIVE': incentive, 'TYPE': type_emp})
    for i in range(0, len(cutting_pd)):
        date       = cutting_pd.iloc[i, 0]
        employee   = cutting_pd.iloc[i, 1]
        sum_bundle = cutting_pd.iloc[i, 2]
        sah        = cutting_pd.iloc[i, 3]
        incentive  = cutting_pd.iloc[i, 4]
        type_emp   = cutting_pd.iloc[i, 5]
        incentive_json.append({'DATE':date, 'EMPLOYEE': employee, 'SUM_BUNDLE': sum_bundle, 'SAH': sah, 'INCENTIVE': incentive, 'TYPE': type_emp})
    
    incentive_pd=pd.DataFrame(incentive_json)
    incentive_group=incentive_pd.groupby('EMPLOYEE').agg({'SUM_BUNDLE':'sum', 'SAH':'sum', 'INCENTIVE':'sum', 'TYPE': 'max'})
    incentive_json=[]
    for i in range(0, len(incentive_group)):
        employee  = incentive_group.index[i]
        incentive = incentive_group.iloc[i, 2]
        fromdate  = get_date_format(datefrom)
        todate    = get_date_format(dateto)
        type_emp  = incentive_group.iloc[i, 3]
        if type_emp=='DR' or (type_emp!='DR' and incentive>10000):
            incentive_json.append({'EMPLOYEE': employee, 'INCENTIVE': incentive, 'DATE_FROM': todate, 'DATE_TO': fromdate})
    incentive_data=pd.DataFrame(incentive_json)
    link='D:\\HanesApp\\public\\Python\\Finance\\ExportReports\\Files\\'
    fileName='Incentive_'+get_date_format(dateto)+'_'+get_date_format(datefrom)+'.xlsx'
    fullPath=link+fileName
    writer = pd.ExcelWriter(fullPath, engine='xlsxwriter')
    incentive_data.to_excel (writer, sheet_name='TOTAL_BY_EMP', index=False)
    incentive_pd.to_excel   (writer, sheet_name='SUMMARY'     , index=False)
    sewing_pd.to_excel      (writer, sheet_name='SEWING'      , index=False)
    mover_new.to_excel      (writer, sheet_name='MOVER'       , index=False)
    cutting_pd.to_excel     (writer, sheet_name='CUTTING'     , index=False)
    writer.save()
    print(fileName)