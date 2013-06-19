/*to improve: could base chart on min and max values, put more into functions, and  could combine some arrays into
 one large array possibly for less lines but would make the syntax MESSY..*/

//create an object prototype for the choices
//this is the equivalent of the initial json response by the web server
function choice(api_name, units, longname, identifier) {
    this.api_name = api_name;
    this.units = units;
    this.longname = longname;
    this.identifier = identifier;
}

//the time to wait before gathering data again in ms
var timeInterval = 7000;
//number of points to display
var numPoints = 10;
//arrays to hold the options, and to hold which options were chosen
var options = [],
selected = [];

//fill the options array with choice objects
options = [new choice('temp_f', 'F', 'Temperature', 1), 
new choice('relative_humidity', '%', 'Humidity', 2), 
new choice('precip_today_in', 'inches', 'Precipitation', 3), 
new choice('wind_mph', 'mph', 'WindSpeed', 4)];

//arrays to hold: data, error, and charts
//each new chart gets a place in each of these arrays to hold its own info
var dataArrays =[],
errorData = [],
charts = [];

function getData() {
    //make the ajax request
    $.ajax({
        //use the url with my api key, and getting data from pws, a variable holding the current location selected
        url: "http://api.wunderground.com/api/ef2d33bb0e324cb1/geolookup/conditions/q/pws:" + pws + ".json",
        dataType: "jsonp",
        //when successful assign current observations to data objects
        success: function (parsed_json) {
            //only parse the json for selected fields
            //for each selected element
            for (var i = 0; i < selected.length; i++) {
                //get the current value 
                var value = parsed_json.current_observation[selected[i].api_name];
                //and update the chart, passing it the new value, and the relevant data, error, and chart arrays
                //those arrays' positions correlate with selected's positions
                updateChart(value, dataArrays[i], charts[i], errorData[i]);
            }
        }
    });
    //repeat this function at certain intervals
    setTimeout(getData, timeInterval);
}

function makeChart(a, pws) {
    //based on the pws, change the location variable to change chart titles
    var location;
    if (pws == 'MLBAC2') {
        location = 'Loveland';
    } else if (pws == 'MCABTP') {
        location = 'Berthoud';
    } else if (pws == 'MCAVLP') {
        location = 'Vail';
    }
    var chart = new Highcharts.Chart({
        chart: {
            //id of where to render it, the selected[i].longname is both for making the id and passed to this function as 'a'
            renderTo: a,
            //the type of chart and type of animation
            type: 'spline',
            animation: Highcharts.svg
            //svg isn't supported by IE8 and earlier so graphs won't display properly
        },
        title: {
            text: location + ' ' + a
        },
        xAxis: {
            type: "datetime",
            //spaces out the time labels to avoid overlap, is based on milliseconds apart, 
            //but they still overlap on smaller screen widths
            tickInterval: timeInterval,
            //changes the time format, i left out hour cause the samples are frequent and space is limited
            dateTimeLabelFormats: {
                millisecond: '%M:%S',
                second: '%M:%S'
            },
            labels: {
                rotation: 90
            }
        },
        yAxis: {
            title: {
                text: a
            }
        },
        //turns off the legend
        legend: {
            enabled: false
        },
        //turns off allowing users to easily print just the chart
        exporting: {
            enabled: false
        },
        //pass two empty series to each chart, one for data(series[0]) and one for error bars (series[1])
        series: [{
            name: 'data',
            type: 'spline',
            data: []
        }, {
            name: 'error',
            type: 'errorbar',
            data: []
        }]
    });
    return chart;
}

function updateChart(obs, data, chart, error) {
    //turn obs into a number without units or other info attached
    obs = parseInt(obs);
    //get the current time
    var time = new Date().getTime();
    //check the size of the series and start knocking data values out of the series when it is greater than numPoints - 1
    if (data.length > numPoints - 1) {
        data.shift();
    }
    if (error.length > numPoints - 1) {
        error.shift();
    }
    //push the new data and time onto the data array
    data.push([time, obs]);
    //same thing, sets every to error to 1 for this example
    error.push([time, obs - 1, obs + 1]);
    //set the data for the series with the new data arrays
    chart.series[0].setData(data);
    chart.series[1].setData(error);
}
 
 //change the pws based on the selection
 function updateLocation(pws) {
    //reset all the arrays to remove the previous location's info, data, and arrays
    charts = [];
    dataArrays = [];
    errorData = [];
    //and remove the elements in the charts div
    $('#charts').children().remove();
    //re add the title
    $('#charts').append("<h2>Real Time Charts</h2>");
    // and re add the charts and arrays for the selected variables
    for (i = 0; i < selected.length; i++) {
        $("<div id='" + selected[i].longname + "' class='chart'>" + selected[i].longname + "</div>").appendTo('#charts');
        charts.push(makeChart(selected[i].longname, pws));
        dataArrays.push([]);
        errorData.push([]);
    }
 }

//jQuery call to start when the document is ready and loaded
$('document').ready( function() {
    //set the correct pws based on selection
    //Loveland = MLBAC2
    //Berthoud = MCABTP
    //Vail = MCAVLP
    pws = 'MLBAC2';
    //when the location selected changes, change the value of pws
    $('#location_selector').change(function () {
        var chosen_one = $(this).find(':selected').val();
        if (chosen_one == $('#love').val() ) {
            pws = 'MLBAC2';
        } else if (chosen_one == $('#bert').val() ) {
            pws = 'MCABTP';
        } else if (chosen_one == $('#vail').val() ) {
            pws = 'MCAVLP';
        }
        updateLocation(pws);
    });
    //display the choices using the options array to choices to the same fieldset
    var $v = $('#variables');
    $v.append('<fieldset data-role="controlgroup" id="field">');
    for (var i = 0; i < options.length; i++) {
       $v.append('<label><input type="checkbox" name="checkbox-' + options[i].identifier + '" class="checkboxes">' + options[i].longname + '</label>');
    }
    $v.append('</fieldset>');
    $("input[type='checkbox']").checkboxradio();

    //when the choices change, update selected
    $('input:checkbox').change(function () {
        //fill the selected[] with the chosen options
        for (var i = 0; i < options.length; i++) {
            //check every checkbox to see if its selected
            if ($('input[name=checkbox-' + options[i].identifier + ']').prop("checked")) {
                //add a marker and set it to true
                var toAdd = true;
                //if options[i] is already somewhere in selected[i] we make the marker false so that we don't have duplicates
                for (var j = 0; j < selected.length; j++) {
                    if (selected[j] == options[i]) {
                        toAdd = false;
                    }
                }
                //check the status of toAdd (false if it is already in selected) and then push it onto the selected array
                if (toAdd) {
                    selected.push(options[i]);
                }
            } else {
                //if it isn't selected now and was previously selected, delete the div and remove it from selected[]
                for (var h = 0; h < selected.length; h++) {
                    //check if any of the selected objects match the current unselected option
                    if (selected[h] == options[i]) {
                        //remove the div holding the chart
                        $("#" + selected[h].longname).remove();
                        //consider putting all these arrays into a holder array
                        //for now remove all at the same point to keep the index consistent across all the arrays
                        dataArrays.splice(h, 1);
                        errorData.splice(h, 1);
                        charts.splice(h, 1);
                        selected.splice(h, 1);
                    }
                }
            }
        }
        //use the selected array to build div's and charts
        for (i = 0; i < selected.length; i++) {
            //to avoid duplicates check if the div doesn't already exist before adding it
            //and to avoid resetting previously selected charts, add a chart only if it's newly selected
            //and push on an empty data set to dataArrays
            if (!$("#" + selected[i].longname).length) {
                //append a div to
                $("<div id='" + selected[i].longname + "' class='chart'>" + selected[i].longname + "</div>").appendTo('#charts');
                charts.push(makeChart(selected[i].longname, pws));
                dataArrays.push([]);
                errorData.push([]);
            }
        }
    });
    //get fresh data from this function
    getData();
});