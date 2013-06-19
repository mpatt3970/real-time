real-time
=========
Michael Patterson
Summer of 2013 Internship at EOL-UCAR
Front End Web Development using JavaScript, jQuery, and HighCharts
=========
Project Description:
=========
  Create a webpage to display real time charts of weather data pushed in by a websocket. The websocket will 
  send the available variable options. It must allow a user to select variables from available options. Then 
  construct charts for those using data as it updates. The purpose is to observe large random fluxes that 
  will indicate a sensor is broken. Error bars must be shown for the data points.
The Back End:
=========
  The back end will be implemented with libwebsockets. It will push json from field embedded devices attached to
  weather sensors. The output will be implemented in NIDAS. The hardware is minimal, only 64 MB of RAM of which 52
  is free, and can only compile C/C++ code in the bourne shell.
Current Status:
=========
  No back end. Uses data from wunderground api and allows the user to select from one of three colorado passes.
Contribution Notes:
=========
  Feel free to contribute any features that you think are useful. Thanks!
  Some Suggestions:
    Change Color for a Flux
    Allow Number of Points to Change
    How will tooltip work in mobile without 'hover'?
    Begin with all variables selected
