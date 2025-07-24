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
        try:
            # The source encoding might be ISO-8859-1 (Latin-1)
            decoded_text = response.content.decode("ISO-8859-1")

            # Save as UTF-8
            filename = f"./public/data/events-{year}.csv"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(decoded_text)

            print(f"CSV for {year} saved as UTF-8: '{filename}'")

        except UnicodeDecodeError as e:
            print(f"Encoding error for year {year}: {e}")

    else:
        print(f"Failed to download file for {year}. HTTP Status Code: {response.status_code}")
