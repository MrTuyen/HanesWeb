import os
from datetime import datetime
import shutil
import time
import schedule

def get_date_format(date):
    year=date[0:4]
    month=date[5:7]
    day=date[8:10]
    return year+month+day

def backup_img():
    source='C:\\Realtime\\Pilot\\'
    try:
        today=datetime.now().strftime('%Y-%m-%d')
        date=get_date_format(today)
        destination='C:\\Realtime\\Pilot\\'+date
        os.rename(source, destination)
        os.mkdir(source)
        entries=os.listdir(destination)
        for r, d, f in os.walk(destination):
            for direct in d:
                dirPath=os.path.join(r, direct)
                dirPath=dirPath.replace(date,'Pilot')
                os.mkdir(dirPath)
        print('done')
    except:
        print('cant rename folder, change to moving file')
        today=datetime.now().strftime('%Y%m%d')
        source= 'C:\\Realtime\\Pilot\\'
        dest1 = 'C:\\Realtime\\Backup\\'+today
        os.mkdir(dest1)
        entries=os.listdir(source)
        for r, d, f in os.walk(source):
            for direct in d:
                dirPath=os.path.join(r, direct)
                dirPath=dirPath.replace('Pilot', '\\Backup\\'+today)
                os.mkdir(dirPath)
        t=0
        for r, d, f in os.walk(source):
            for entry in f:
                if 'done' in entry:
                    try:
                        sourcePath=os.path.join(r, entry)
                        destinationPath=sourcePath.replace('Pilot', '\\Backup\\'+today)
                        shutil.move(sourcePath, destinationPath)
                    except:
                        t=t+1
        if t<5:
            print('done')
        else:
            print('fail')


schedule.every().day.at("23:30").do(backup_img)
print(datetime.datetime.now())
print('shedule start')

# run pending
while True:
    schedule.run_pending()
    time.sleep(1)    
