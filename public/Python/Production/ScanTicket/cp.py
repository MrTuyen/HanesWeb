import cv2
from pyzbar import pyzbar
from pyzbar.pyzbar import decode
from pyzbar.pyzbar import ZBarSymbol
import math
import numpy as np
import os
from pathlib import Path
import string
import pandas as pd
import mysql.connector
from datetime import datetime
from sqlalchemy import create_engine
from win32api import GetSystemMetrics
#import random
import datetime
engine_hbi = create_engine('mysql+mysqlconnector://root:Hy$2020@hyspayqsqlv:3306/pr2k', echo=False)
hostname='hyspayqsqlv'#'127.0.0.1'


print("Width =", GetSystemMetrics(0))
print("Height =", GetSystemMetrics(1))


def run1(loadLink):
    print('start proccessing')
    try:
        entries=os.listdir(loadLink)
    except:
        entries=[]
    i=1
    if len(entries)>0:
        for entry in entries:
            if 'jpg' in entry:
                filePath=loadLink+'\\'+entry
                lenlink=len(loadLink)
                filePath=filePath.replace("\\","/")
                print(filePath)
                ex_img=0
                if ex_img==0:
                    barcodeList=[]
                    if os.path.isfile(filePath):
                        image=cv2.imread(filePath)
                        print(image.shape)
                        output_img, barcodeList,xlist,ylist,wlist,hlist=imgProcess(image)
                        fnew=filePath[:-4]+'_done.jpg'
                        imgname=fnew[lenlink+1:]
                        # j=len(barcodeList)
                        # while j-1>=0:
                        #     print('(x='+str(xlist[j-1])+' to '+str(xlist[j-1]+wlist[j-1])+',y='+str(ylist[j-1])+' to '+str(ylist[j-1]+hlist[j-1])+') barcode : '+barcodeList[j-1])
                        #     j=j-1
                        l=0
                        bundle=[]
                        employee=[]
                        defect=[]
                        wlot=''
                        typebc=''
                        qc=''
                        while l<len(barcodeList):
                            bc=str(barcodeList[l])
                            # print(bc)
                            record=tuple((bc,xlist[l],ylist[l],wlist[l],hlist[l]))
                            if len(bc)==10:
                                if bc.isnumeric():
                                    wlot=bc
                                else:
                                    bundle.append(record)
                            if len(bc)==5:
                                employee.append(record)
                            if len(bc)==3:
                                defect.append(record)
                            if len(bc)==6:
                                qc=bc
                            if bc.isnumeric():
                                notnumber=0
                            else:
                                if len(bc)<10:
                                    typebc=bc
                            l=l+1
                        m=len(bundle)-1
                        map_ticket=[]
                        while m>=0:
                            tk=str(bundle[m][0])
                            emptk=''
                            defecttk='000'
                            # print(bundle)
                            # print('limit from ',bundle[i][2],' to ',bundle[i][2]+bundle[i][4])
                            eok=0
                            n=len(employee)-1
                            while n>=0:
                                cood_emp=employee[n][2]+employee[n][4]/2
                                # print(tk,employee[n][0],bundle[m][2],bundle[m][2]+bundle[m][4],employee[n][2],employee[n][2]+employee[n][4])
                                if bundle[m][2]<=cood_emp and bundle[m][2]+bundle[m][4]>=cood_emp:
                                    eok=1
                                    emptk=employee[n][0]
                                    # print('cood_emp ',cood_emp)
                                    x1=int(bundle[m][1]+bundle[m][3])
                                    y1=int(bundle[m][2]+bundle[m][4]/2)
                                    x2=int(employee[n][1])
                                    y2=int(employee[n][2]+employee[n][4]/2)
                                    output_img=cv2.line(output_img,(x1,y1),(x2,y2),(255,0,0),2)
                                    break
                                n=n-1
                            n=len(employee)-1
                            while n>=0 and eok==0:
                                if bundle[m][2]>=employee[n][2] and bundle[m][2]<=employee[n][2]+employee[n][4] and eok==0:
                                    eok=1
                                    emptk=employee[n][0]
                                    # print('cood_emp ',cood_emp)
                                    x1=int(bundle[m][1]+bundle[m][3])
                                    y1=int(bundle[m][2]+bundle[m][4]/2)
                                    x2=int(employee[n][1])
                                    y2=int(employee[n][2]+employee[n][4]/2)
                                    output_img=cv2.line(output_img,(x1,y1),(x2,y2),(255,0,0),2)
                                    break
                                n=n-1
                            n=len(employee)-1
                            while n>=0 and eok==0:
                                if bundle[m][2]+bundle[m][4]>=employee[n][2] and bundle[m][2]+bundle[m][4]<=employee[n][2]+employee[n][4] and eok==0:
                                    eok=1
                                    emptk=employee[n][0]
                                    # print('cood_emp ',cood_emp)
                                    x1=int(bundle[m][1]+bundle[m][3])
                                    y1=int(bundle[m][2]+bundle[m][4]/2)
                                    x2=int(employee[n][1])
                                    y2=int(employee[n][2]+employee[n][4]/2)
                                    output_img=cv2.line(output_img,(x1,y1),(x2,y2),(255,0,0),2)
                                    break
                                n=n-1
                            n=len(defect)-1
                            dok=0
                            while n>=0:
                                cood_def=defect[n][2]+defect[n][4]/2
                                if bundle[m][2]<=cood_def and bundle[m][2]+bundle[m][4]>=cood_def and dok==0:
                                    dok=1
                                    defecttk=defect[n][0]
                                    # print('cood_defect ',cood_def)
                                    x1=int(bundle[m][1]+bundle[m][3])
                                    y1=int(bundle[m][2]+bundle[m][4]/2)
                                    x2=int(defect[n][1])
                                    y2=int(defect[n][2]+defect[n][4]/2)
                                    output_img=cv2.line(output_img,(x1,y1),(x2,y2),(255,0,0),2)
                                    break
                                n=n-1
                            n=len(defect)-1
                            while n>=0 and dok==0:
                                if bundle[m][2]>=defect[n][2] and bundle[m][2]<=defect[n][2]+defect[n][4] and dok==0:
                                    dok=1
                                    defecttk=defect[n][0]
                                    # print('cood_emp ',cood_emp)
                                    x1=int(bundle[m][1]+bundle[m][3])
                                    y1=int(bundle[m][2]+bundle[m][4]/2)
                                    x2=int(defect[n][1])
                                    y2=int(defect[n][2]+defect[n][4]/2)
                                    output_img=cv2.line(output_img,(x1,y1),(x2,y2),(255,0,0),2)
                                    break
                                n=n-1
                            n=len(defect)-1
                            while n>=0 and dok==0:
                                if bundle[m][2]+bundle[m][4]>=defect[n][2] and bundle[m][2]+bundle[m][4]<=defect[n][2]+defect[n][4] and dok==0:
                                    dok=1
                                    defecttk=defect[n][0]
                                    # print('cood_emp ',cood_emp)
                                    x1=int(bundle[m][1]+bundle[m][3])
                                    y1=int(bundle[m][2]+bundle[m][4]/2)
                                    x2=int(defect[n][1])
                                    y2=int(defect[n][2]+defect[n][4]/2)
                                    output_img=cv2.line(output_img,(x1,y1),(x2,y2),(255,0,0),2)
                                    break
                                n=n-1
                            tk_tuple=tuple((tk,emptk,defecttk,wlot,qc,typebc,imgname))
                            map_ticket.append(tk_tuple)
                            # print(map_ticket)
                            m=m-1
                        cv2.imwrite(fnew, output_img)
                        os.remove(filePath)
                        i+=1
                        tmap=0
                        thisTime=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        # mydb=mysql.connector.connect(host=hostname, user='root', passwd='Hy$2020', database="pr2k")
                        # myCursor=mydb.cursor()
                        while tmap<len(map_ticket):
                            print(map_ticket[tmap])
                            # bdtk=map_ticket[tmap][0]
                            # idnv=map_ticket[tmap][1]
                            # defectnv=map_ticket[tmap][2]
                            # wlot_nv=map_ticket[tmap][3]
                            # nvqc=map_ticket[tmap][4]
                            # imlink=map_ticket[tmap][5]
                            # if idnv!='':
                            #     checktk=pd.read_sql('select ticket from pr2k.bundleticket_active where ticket="'+str(bdtk)+'";',engine_hbi)
                            #     engine_hbi.dispose()
                            #     if len(checktk)>0:
                            #         check_sc=pd.read_sql('select employee,QC,IRR,file,timeupdate from pr2k.employee_scanticket where ticket="'+str(bdtk)+'";',engine_hbi)
                            #         engine_hbi.dispose()
                            #         if len(check_sc)>0:
                            #             if check_sc.iloc[0,0]==idnv:
                            #                 sql_update_tk='update pr2k.employee_scanticket set file="'+str(imlink)+'",qc="'+str(check_sc.iloc[0,1])+'",IRR="'+str(defectnv)+'",timemodified="'+str(thisTime)+'" where ticket="'+str(bdtk)+'" and employee="'+str(idnv)+'";'
                            #                 print(sql_update_tk)
                            #                 myCursor.execute(sql_update_tk)
                            #                 mydb.commit()
                            #             else:
                            #                 sql_insert_alert_tk=('insert into pr2k.bundleticket_alert (ticket,work_lot,old_employee,old_file,old_irr,old_timeupdate,new_employee,new_file,new_irr,new_timeupdate) values ("'
                            #                                     +str(bdtk)+'","'+str(wlot_nv)+'","'+str(check_sc.iloc[0,0])+'","'+str(check_sc.iloc[0,3])+'","'+str(check_sc.iloc[0,2])+'","'+str(check_sc.iloc[0,4])+'","'+str(idnv)+'","'+str(imlink)+'","'+str(defectnv)+'","'+str(thisTime)+'");')
                            #                 print(sql_insert_alert_tk)
                            #                 myCursor.execute(sql_insert_alert_tk)
                            #                 mydb.commit()
                            #         else:
                            #             sql_insert_scan=('insert into pr2k.employee_scanticket (ticket,employee,qc,irr,file) values ("'
                            #                             +str(bdtk)+'","'+str(idnv)+'","'+str(nvqc)+'","'+str(defectnv)+'","'+str(imlink)+'");')
                            #             print(sql_insert_scan)
                            #             myCursor.execute(sql_insert_scan)
                            #             mydb.commit()
                            #             print(sql_insert_scan)
                            tmap=tmap+1
                        # myCursor.close()
                        


                        
                    # wlot=''
                    # if len(barcodeList)>0:
                    #     slist=0
                    #     while slist<len(barcodeList):
                    #         try:
                    #             wlot=str(int(barcodeList[slist]))
                    #         except:
                    #             unknow=0
                    #         slist=slist+1
                    # if len(wlot)!=10:
                    #     wlot=''
                    # keyimg=wlot+filePath
            else:
                run1(loadLink+'/'+entry)

def imgProcess(image):
    try:
        pyzbarImage=image.copy()
        gray=cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        canny=cv2.Canny(gray, 255, 255, 1)
        blur=cv2.blur(canny, (8, 8))
        kernel = np.ones((3, 3), np.uint8)
        img_dilate = cv2.dilate(blur, kernel, iterations=1)
        img_media=cv2.medianBlur(img_dilate, 3)
        _, threshold=cv2.threshold(img_media, 0, 255, cv2.THRESH_BINARY)
        contours, h=cv2.findContours(threshold.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        barcode_list=[]
        x_list=[]
        y_list=[]
        h_list=[]
        w_list=[]
        for cnt in contours:            
            (x, y, w, h)=cv2.boundingRect(cnt)
            # print("w+h=",w+h)
            if w+h>=300 and w+h<900:
                rect=cv2.minAreaRect(cnt)
                angle=rect[2]
                # print(angle)
                box=cv2.boxPoints(rect)
                box=np.int0(box)
                subImg=image[y:y+h, x:x+w] # cắt ảnh
                # cv2.imshow("img",subImg)
                # cv2.waitKey(0)
                sub_rows, sub_cols, _=subImg.shape
                if angle>80:
                    rot=cv2.getRotationMatrix2D((sub_cols/2, sub_rows/2), angle-90, 1)
                else:
                    rot=cv2.getRotationMatrix2D((sub_cols/2, sub_rows/2), angle, 1)
                subImg=cv2.warpAffine(subImg, rot, (sub_cols, sub_rows))
                scale=100
                width=int(subImg.shape[1]*scale/100)
                height=int(subImg.shape[0]*scale/100)
                dim=(width, height)
                # print(dim)
                scaled_img=cv2.resize(subImg, dim)
                # cv2.imshow("img",scaled_img)
                # cv2.waitKey(0)
                barcodes=pyzbar.decode(scaled_img,symbols=[ZBarSymbol.CODE39])
                # print(barcodes)
                if len(barcodes)>0:
                    barcode=barcodes[0][0]
                    barcode_temp=str(barcode,'utf-8')
                    # if barcode_temp not in barcode_list:
                    if 1>0:
                        barcode_list.append(str(barcode, 'utf-8'))
                        x_list.append(x)
                        y_list.append(y)
                        h_list.append(h)
                        w_list.append(w)
                        cv2.putText(image, str(barcode, 'utf-8'), (x,y+int(height/2)), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,165,255), 4)
                        cv2.rectangle(image, (x,y), (x+w,y+h), (255,0,0), 4)
        return image, barcode_list,x_list,y_list,w_list,h_list
    except:
        print('file error')
        barcode_list=[]
        return image, barcode_list,x_list,y_list,w_list,h_list

font = cv2.FONT_HERSHEY_SIMPLEX  
fontScale = 1
color = (255, 0, 0) 
thickness = 2
linki=os.getcwd()
linki='C:\\Realtime\\Pilot'
print(linki)
run1(linki)
cv2.destroyAllWindows()
print('finish')