# pvwatts-modeling-tool

# Install Instructions
Clone repository
cd into the repository
In the command line type npm i to install dependencies
In the command line type MYAPIKEY=DEMO_KEY node model.js to run the program
Follow the prompts and enter the inputs as requested
When the program is complete you will see DONE if it was successful or an error message if the request did not go through correctly
Open the output.csv file to see all historic API request outputs with the newest output at the bottom

# Possible Improvements
The utility rate returned from that API is the standard rate for that region and building type, but it does not necessarily reflect the full value being saved per kWh generated by solar. Those utility rates likely do not include other charges proportional to consumption or charges added to commercial properties based on their highest consumption point of the year etc. The program would be more flexible if it gave the option to use the utility rate provided by the API or let the user input their own $/kWh value if they have additional information about the buildings utility bills.
Each successful API call is appended to the end of the CSV file without any identification. I would like to add some way to identify each API call and set up the program so the same API call does not produce another identical output.

