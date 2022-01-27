# -*- coding: utf-8 -*-
"""
Created on Tue May 26 09:18:19 2020

@author: dule4
"""
import sys, json
# import mysql.connector, mysql
import pandas as pd
from sqlalchemy import create_engine
import numpy as np

hostname='pbvweb01v'
engine = create_engine('mysql+mysqlconnector://root:123456@pbvweb01v:3306/pr2k', echo=False)
engineNam = create_engine('mysql+mysqlconnector://root:123456@pbvweb01v:3306/erpsystem', echo=False)


if __name__=="__main__":
    group = sys.argv[1]
    shift = sys.argv[2]
    date  = sys.argv[3]
    sql   = ('select setup_emplist.ID, setup_emplist.Name, setup_emplist.Line '
             +' from setup_emplist inner join setup_location '
             +' on setup_emplist.Line=setup_location.Location '
             +' where setup_location.NameGroup="'+group+'" and setup_emplist.Shift like "'+shift+'%" and setup_emplist.`Type`="DR"'
             +' order by Line;')
    emp_data=pd.read_sql(sql, engineNam)
    engineNam.dispose()
    emp_size=len(emp_data)
    dataset=[]
    if emp_size>0:
        for row in range(0, emp_size):
            ID   = str(emp_data.iloc[row, 0])
            name = emp_data.iloc[row, 1]
            line = emp_data.iloc[row, 2]
            sql=('select OPERATION, OPERATION_CODE, COUNT(BUNDLE) AS BUNDLE, SUM(EARNED_HOURS) AS SAH'
                +' from employee_scanticket'
                +' where EMPLOYEE="'+str(ID[1:6])+'" and DATE="'+date+'"'
                +' group by OPERATION_CODE;')
            bundle_data   = pd.read_sql(sql, engine)
            if len(bundle_data)>0:
                for bundle_row in range(0, len(bundle_data)):
                    operation = str(bundle_data.iloc[bundle_row, 1])+' - '+str(bundle_data.iloc[bundle_row, 0])#.rstrip()
                    bundle    = str(bundle_data.iloc[bundle_row, 2])
                    if str(bundle_data.iloc[bundle_row, 3]).isdigit():
                        sah   = str(round(bundle_data.iloc[bundle_row, 3]/60,2))
                    else:
                        sah   = '0'
                    dataset.append({'ID':ID, 'Name':name, 'Line':line, 'Operation':operation, 'Bundle':bundle, 'SAH': sah})
            else:
                dataset.append({'ID':ID, 'Name':name, 'Line':line, 'Operation':'', 'Bundle':'0', 'SAH':'0'})
        engine.dispose()
    if len(dataset)==0:
        dataset.append({'result':'fail'})
    data_json=json.dumps(dataset)
    print(data_json)
    