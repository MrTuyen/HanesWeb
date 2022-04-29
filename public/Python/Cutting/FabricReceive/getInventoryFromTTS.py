import pyodbc
import pandas as pd
import mysql.connector
import sys
import math
import json

if __name__ == "__main__":
    jsonData = json.loads(sys.argv[1])

    try:
        connection = pyodbc.connect(
            driver='{IBM i Access ODBC Driver}',
            system='HQ400B',
            uid=f'{jsonData["account"]}',
            pwd=f'{jsonData["password"]}'
        )

        query = '''
            SELECT 
                P.*, 
                (
                    SELECT ICP2515.FCCOMM 
                    FROM HQ400B.ICLIB.ICP2515 ICP2515 
                    WHERE 
                    ICP2515.FCHROL = P.RUNIP 
                    order by 
                    ICP2515.FCDATE DESC, 
                    ICP2515.FCTIME DESC 
                    fetch first 1 rows only
                ) AS QCComment, 
                (
                    SELECT ICP2515.FCDATE 
                    FROM HQ400B.ICLIB.ICP2515 ICP2515 
                    WHERE ICP2515.FCHROL = P.RUNIP 
                    order by 
                    ICP2515.FCDATE desc, 
                    ICP2515.FCTIME desc 
                    fetch first 1 rows only
                ) AS DateComment, 
                (
                    SELECT ICP2515.FCTIME 
                    FROM HQ400B.ICLIB.ICP2515 ICP2515 
                    WHERE ICP2515.FCHROL = P.RUNIP 
                    ORDER BY ICP2515.FCDATE desc, ICP2515.FCTIME desc 
                    fetch first 1 rows only
                ) AS TimeComment 
            FROM 
            (
                SELECT 
                DISTINCT ICP0152.RUNIP, 
                ICP0152.RDYLOT, 
                ICP0152.RCUTWO, 
                ICP0152.RCOLOR, 
                ICP0152.RLNVAR, 
                ICP0152.RGRADE, 
                ICP0152.RFINWT * ICP9510.CVCONV AS YARD, 
                ICP0152.RFINWT, 
                ICP0152.RDYEDT, 
                ICP0152.RFINDT, 
                ICP0152.RRSTAT, 
                ICP0152.RLSTDT, 
                ICP0152.RLOCDP, 
                ICP0152.RLOCBR, 
                ICP0152.RFSTYL, 
                ICP0152.RFFSTY, 
                ICP0152.RUSER, 
                ICP0152.RCCUST, 
                ICP0152.RSHAPR, 
                ICP0152.RCUTWD, 
                ICP0152.RPRTCD, 
                SUBSTR(C.IXSKU# ,27,6) AS ACTUAL_WITH,
                C.IXABSHD AS SHADE,
                C.IXVENDR AS VENDOR,
                ICP0152.RLOCPL AS PLANT
                FROM 
                    HQ400B.ICLIB.ICP0152 ICP0152, 
                    HQ400B.ICLIB.ICP9510 ICP9510, 
                    HQ400B.ICLIB.ICPCSREF C 
                WHERE 
                    (ICP0152.RLOCPL IN ('95', '92'))
                    AND (
                        ICP0152.RRSTAT In ('20', '25')
                    ) 
                    AND (
                        REPLACE(
                        REPLACE(ICP0152.RCUTWD, '.', ''), 
                        0, 
                        ''
                        )= REPLACE(
                        SUBSTR(ICP9510.CVITEM, 13, 5),
                        0, 
                        ''
                        )
                    ) 
                    AND (
                        LEFT(
                        TRIM(ICP9510.CVITEM), 
                        6
                        )=(ICP0152.RFFSTY)
                    ) 
                    AND (ICP9510.CVUOMT = 'YD') 
                    AND ICP0152.RUNIP = C.IXHROLL 
                    AND C.IXTYPE = 'F' 
                    ORDER BY 
                    ICP0152.RUNIP
                ) AS P
        '''

        df = pd.read_sql(query, connection)

        totalRows = len(df)
        mydb = mysql.connector.connect(
            host="10.113.99.3", user='root', passwd='123456', database="cutting_system")
        myCursor = mydb.cursor()
        values = []
        for index, row in df.iterrows():

            tempUnipack = str(row.RUNIP).split('.')[0]
            unipack2 = '0' + tempUnipack if len(tempUnipack) < 8 else tempUnipack
            itemColor = row.RFFSTY + '-' + row.RCOLOR + '-' + str(row.RCUTWD).split('.0')[0]
            if len(row.RPRTCD.strip()) > 0:
                itemColor = row.RFFSTY + row.RPRTCD.strip() + str(row.RCUTWD).split('.0')[0]

            temp = (
                row.RUNIP,
                unipack2,
                row.RCUTWO,
                row.RFFSTY,
                itemColor,
                row.RCUTWD,
                row.RCOLOR,
                row.RFINWT,
                row.YARD,
                row.RLOCBR,
                str(row.RGRADE).split('.')[0],
                row.SHADE,
                '',
                '',
                '',
                '',
                row.VENDOR,
                '',
                '',
                '',
                row.QCCOMMENT,
                row.ACTUAL_WITH,
                str(row.ACTUAL_WITH).replace('0', ''),
                row.VENDOR,
                row.RPRTCD,
                jsonData["user"],
                jsonData["datetime"],
                row.PLANT
            )

            values.append(temp)

        query = '''INSERT INTO cutting_fr_wh_fabric_inventory (
                runip,
                unipack2,
                rcutwo,
                rffsty,
                item_color,
                rcutwd,
                rcolor,
                rfinwt,
                yard,
                rlocbr,
                rgrade,
                shade,
                vendor_lot,
                po_number,
                rccust,
                rlstdt,
                vender,
                rlocdp,
                rrstat,
                ruser,
                qccomment,
                actual_with,
                with_actual,
                vendor,
                rprtcd,
                user_update,
                date_update,
                plant
            ) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s, %s, %s, %s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''

        loopNumber = math.ceil(len(values) / 1000)
        for i in range(loopNumber):
            index = i * 1000
            tempList = values[index : index + 1000]
            myCursor.executemany(query, tempList)
            mydb.commit()
 
        mydb.close()
        print("ok")

    except Exception as e:
        print(e)
