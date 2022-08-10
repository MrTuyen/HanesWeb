import pandas as pd
import mysql.connector

if __name__ == "__main__":
    try:
        df = pd.read_excel("templates\ctex.xlsx", "ctex")

        mydb = mysql.connector.connect(host="10.113.99.3", user='root', passwd='123456', database="cutting_system")
        myCursor = mydb.cursor()
        values = []
        for index, row in df.iterrows():
            temp = (
                row[0],
                row[1],
                row[3],
                row[4],

            )

            values.append(temp)

        query = '''INSERT INTO cutting_fr_ctex (
                color,
                wc,
                material_content,
                note
            ) 
            VALUES (%s, %s, %s, %s)'''

        myCursor.executemany(query, values)
        mydb.commit()

        mydb.close()
        print("ok")
        
    except Exception as e:
        print(e)
