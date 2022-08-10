import pyodbc
import pandas as pd
import sys
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

        query = f'''
            UPDATE HQ400B.ICLIB.ICP0152 ICP0152
            SET ICP0152.RLOCBR = '{jsonData["location"]}'
            WHERE ICP0152.RUNIP IN ({jsonData["data"]})
        '''
        df = pd.read_sql(query, connection)

        print("ok")

    except Exception as e:
        print(e)
