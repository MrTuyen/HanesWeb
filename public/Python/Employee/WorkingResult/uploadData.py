# -*- coding: utf-8 -*-
"""
Created on Fri Mar 27 22:23:48 2020

@author: dule4
"""
import sys, json
import mysql.connector, mysql
import pandas as pd
import mysql.connector
hostname='pbvweb01v'#'127.0.0.1'


if __name__=="__main__":
    data=pd.read_excel('01042020KYXACNHANGIOLAMVIEC.xlsx', usecols=[0, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13])
    mydb=mysql.connector.connect(host=hostname, user='root', passwd='123456', database="erphtml")
    myCursor=mydb.cursor()
    len_data=len(data)
    for row in range(0, len_data):
        ID=str(data.iloc[row, 0])
        day=str(data.iloc[row, 1][0:2])
        month=str(data.iloc[row, 1][3:5])
        year=str(data.iloc[row, 1][6:10])
        date=year+'-'+month+'-'+day
        shift=data.iloc[row,2]
        reg_in=str(data.iloc[row, 3])
        if reg_in=='nan':
            reg_in=''
        reg_out=str(data.iloc[row, 4])
        if reg_out=='nan':
            reg_out=''
        ab=str(data.iloc[row, 5])
        late=str(data.iloc[row, 6])
        soon=str(data.iloc[row, 7])
        ot150=str(data.iloc[row, 8])
        ot200=str(data.iloc[row, 9])
        ot300=str(data.iloc[row, 10])
        query=('insert into employee_workinghrs (ID, Shift, Month, Year, Date, Reg_In, Reg_Out, Absenteeism, Late, Soon, OT150, OT200, OT300) '
               'values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)')
        values=(ID, shift, month, year, date, reg_in, reg_out, ab, late, soon, ot150, ot200, ot300)
        myCursor.execute(query, values)
        mydb.commit()
        print(row)
    mydb.close()