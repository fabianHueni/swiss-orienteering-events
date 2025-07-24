import requests
from datetime import datetime

# Base URL template
url_template = "https://www.o-l.ch/cgi-bin/fixtures?&year={year}&kind=-1&csv=1"

# Get current and next year
current_year = datetime.now().year
years = [current_year, current_year + 1]

# Download and save CSV files for each year
for year in years:
    url = url_template.format(year=year)
    response = requests.get(url)

    if response.status_code == 200:
        filename = f"../public/data/ol_fixtures_{year}.csv"
        with open(filename, "wb") as file:
            file.write(response.content)
        print(f"CSV for {year} saved as '{filename}'.")
    else:
        print(f"Failed to download file for {year}. HTTP Status Code: {response.status_code}")
