import pandas as pd
import mysql.connector

if __name__ == "__main__":
    try:
        df = pd.read_excel("templates/vendor.xlsx", "vendor", dtype = str)

        mydb = mysql.connector.connect(host="10.113.99.3", user='root', passwd='123456', database="cutting_system")
        myCursor = mydb.cursor()
        values = []
        for index, row in df.iterrows():
            temp = (
                str(row[0].replace(",", ",")),
                str(row[1])
            )

            values.append(temp)

        query = '''INSERT INTO cutting_fr_vendor (
                vendor_name,
                vendor_code
            ) 
            VALUES (%s, %s)'''

        myCursor.executemany(query, values)
        mydb.commit()

        mydb.close()
        print("ok")
        
    except Exception as e:
        print(e)
