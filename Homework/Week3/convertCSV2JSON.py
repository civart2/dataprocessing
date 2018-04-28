#!/usr/bin/python3
#made by Civio Arts

import csv
import json

def main():
    # asks user the file location to convert
    input_location = input("Read location:")

    # asks user where the save the converted file
    output_location = input("Write location:")

    # declare jsonlist for json objects
    jsonlist = []

    # read csv file and convert it to json
    with open(input_location, 'r') as csvfile:
        reader = csv.reader(csvfile)

        # loop over lines in csv file
        for row in reader:
            # computer temporary list and attend to list
            data = dict()
            data["Province"] = row[0]
            data["Score"] = row[1]
            jsonlist.append(data)

    jsondump = {"data":jsonlist}

    # save the converted file
    with open(output_location, 'w') as output_file:
        json.dump(jsondump, output_file)

    print("Converting done.")
if __name__ == "__main__":
    main()
