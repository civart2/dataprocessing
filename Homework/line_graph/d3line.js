/* 
 * Assignment: Line Graph
 * Student name: Civio Arts
 * Student nr: 11043946
 * University: UvA
 */

window.onload = function()
{           
    // load datasets and call for processing
    queue()
	.defer(d3.json, "regenval.json")
        .defer(d3.json, "zonneschijn.json")
	.await(designChart);
}

// processes the data loaded in window.onload
function processData(data)
{
    // retrieve keys from dataset
    var keys = Object.keys(data.value[0]);
    
    // convert object to array for easier functionality (like the use of map)
    var newData = [];
    
    for (var key in data.value)
        newData.push(data.value[key]);
    
    // change period to number
    newData.forEach(d => { d.Perioden = +d.Perioden; });

    // define data variables
    var year = newData.map(d => {
                return {    
                            "key":d[keys[0]],
                            "value":d.Jaargemiddelde, 
                            "name":"Year",
                            "title": data.title
                        }; 
                    }),

    winter = newData.map(d => {
                return {    
                            "key":d[keys[0]],
                            "value":d.Wintergemiddelde, 
                            "name":"Winter"
                        };
                    }),
    
    summer = newData.map(d => {
                return {    
                            "key":d[keys[0]],
                            "value":d.Zomergemiddelde, 
                            "name":"Summer"
                        };
                    });
   
    // append new variables to newData-array
    newData = [year, winter, summer];
    
    // design chart
    return newData;
}

// design the chart
function designChart(error, data, data2)
{
    // check for errors
    if (error)
        throw error;
    
    // declare constants
    const MARGIN = {top: 20, right: 20, bottom: 20, left: 40}
          WIDTH = 960 - MARGIN.left - MARGIN.right,
          HEIGHT = 500 - MARGIN.top - MARGIN.bottom;
  
    // insert source and description
    d3.select("#source").text("Source: " + data.source)
                        .insert("p")
                        .text("Description: " + data.description);

    // select svg element
    var svg = d3.select("#graph"),
            
    // define container for svg-elements
    g = svg.append("g")
        .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top +")");

    // append title
    g.append("text")
        .attr("class", "title")
        .attr("x", "40%")
        .text(data.mainTitle);

    // process data
    var data = processData(data),
        sunshineData = processData(data2);

    // define scales (x, y and color)
    var xScale = d3.scaleTime().range([0, WIDTH]),
        yScale = d3.scaleLinear().rangeRound([HEIGHT, 0]),
        zScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // define domains
    xScale.domain(d3.extent(data[0], d => { return d.key; } ));
    yScale.domain([0, d3.max(data, d => { return Math.ceil(d[3].value); })]);
    zScale.domain(d => { return d; });
    
    // draw the axis
    drawAxis(data, g, xScale, yScale, MARGIN);
        
    // draw lines
    drawLine(data, g, xScale, yScale, zScale, MARGIN);

    // define rectange to get mouse-movement-coordination
    var mouseRadar = svg.append("rect")
                        .attr("id", "mouse-radar")
                        .attr("width", WIDTH + 60)
                        .attr("height", HEIGHT)
                        .attr("transform", "translate(" + MARGIN.left + "," 
                                                        + MARGIN.top + ")");
    
    mouseRadar.on("mousemove", function() {
                // hide all boxes
                d3.selectAll(".data").attr("fill-opacity", "0");

                // get mouse coordinates 
                var mouse = d3.mouse(this);

                // get period
                var xValue = "#databox" + Math.round(xScale.invert(mouse[0]));

                // show box
                d3.selectAll(xValue)
                  .attr("fill-opacity", "0.4");
            })
             .on("mouseout", function(){
                // hide box
                d3.selectAll(".data").attr("fill-opacity", "0");
            });

    // implement dropdown-list
    var list = d3.select("body")
                 .insert("select", "#graph")
                 .attr("class", "list")
                 .on("change", function() { 
                      selectUpdate(data, sunshineData, g, xScale, yScale); 
                  });
    
    // insert text next to dropdown-list
    var dropdownText = d3.select("body").insert("p", ".list")
                         .attr("class", "list")
                         .attr("top", 30)
                         .attr("x", "40")
                         .text("Choose weathertype");    
    
    // define choices
    var options = ["rain", "sun"];
    
    // name options
    list.selectAll("option")
        .data(options)
        .enter()
        .append("option")
        .text(d => { return d });
}

// updates after selection from list
function selectUpdate(data, data2, g, xScale, yScale)
{
    var selection = d3.select("select").property("value"),
        choice = {"rain":data, "sun":data2};

    update(choice[selection], g, xScale, yScale);
}

// draws the Axis
function drawAxis(data, g, xScale, yScale, MARGIN)
{
    // define Axes;
    var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")),
        yAxis = d3.axisLeft(yScale);

    // draw x-axis
    g.append("g")
       .attr("id", "xAxis")
       .attr("class", "axis")
       .call(xAxis)
       .attr("transform", "translate(0," + HEIGHT + ")")
       .append("text")
       .attr("x", WIDTH)
       .attr("y", -10)
       .text("PERIOD");
    
    // draw y-axis
    g.append("g")
       .attr("id", "yAxis")
       .attr("class", "axis")
       .call(yAxis)
       .append("text")
       .attr("id", "yTitle")
       .attr("transform", "rotate(-90)")
       .attr("y", MARGIN.left / 2)
       .text(data[0][0].title);
}
            
// draws the lines, dots and boxes
function drawLine(data, g, xScale, yScale, zScale, MARGIN)
{
    // define line generator
    var lineGen = d3.line()
                    .x(d => { return xScale(d.key); })
                    .y(d => { return yScale(d.value); });
    
    // draw lines
    for (let i = 0; i < data.length; i++)
    {
        g.append("path")
            .attr("id", "path" + i)
            .attr("d", lineGen(data[i]))
            .attr("stroke", d => { return zScale(i); });
        
        // get array-length
        var dataLength = data[i].length;
        
        // append labels next to lines
        g.append("g")
            .append("text")
            .attr("id", "label" + i)
            .attr("class", "label")
            .attr("x", xScale(d3.max(
                               data[i].map(d => { return d.key; } )))
                    )
            .attr("y", yScale(data[i][dataLength-1].value)-8)
            .text(data[i][i].name);
        
        for (let j = 0; j < dataLength; j++)
        {
            // append databox
            var rect = g.append("g")
                        .attr("id", "databox" + data[i][j].key)
                        .attr("width", WIDTH)
                        .attr("class", "data")
                        .attr("fill-opacity", 0);
            
            // append circle for information
            rect.append("circle")
                .attr("id", "circle" + i)
                .attr("class", "dot")
                .attr("cx", xScale(data[i][j].key))
                .attr("cy", yScale(data[i][j].value))
                .attr("r", 5)
                .attr("fill", zScale(i)); 
        
            rect.append("rect")
                .attr("id", "rect" + i)
                .attr("class", "databox")
                .attr("x", xScale(data[i][j].key))
                .attr("y", yScale(data[i][j].value))
                .attr("fill", zScale(i)); 
        
            // add period text
            rect.append("text")
                .attr("id", "text" + i)
                .attr("class", "data-text")
                .attr("x", xScale(data[i][j].key))
                .attr("y", yScale(data[i][j].value))
                .attr("dx", "1em")
                .attr("dy", "1.5em")
                .text("Period: " + data[i][j].key);

            // add value text
            rect.append("text")
                .attr("id", "text" + i + j)
                .attr("class", "data-text")
                .attr("x", xScale(data[i][j].key))
                .attr("y", yScale(data[i][j].value))
                .attr("dx", "1em")
                .attr("dy", "2.5em")
                .text("Value: " + data[i][j].value);
        }
    }
}

function update(data, g, xScale, yScale)
{
    // update axis
    var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")),
        yAxis = d3.axisLeft(yScale);
    
    // update domain
    xScale.domain(d3.extent(data[0], d => { return d.key; } ));
    yScale.domain([0, d3.max(data, d => { return Math.ceil(d[3].value); })]);
    
    // change xAxis and yAxis
    var x = d3.selectAll("#xAxis").call(xAxis);
    var y = d3.selectAll("#yAxis").call(yAxis);
    
    // update title
    y.selectAll("#yTitle").text(data[0][0].title);
    
    // define line generator
    var lineGen = d3.line()
                    .x(d => { return xScale(d.key); })
                    .y(d => { return yScale(d.value); });
            
    // update lines
    for (let i = 0; i < data.length; i++)
    {
        // get array-length
        var dataLength = data[i].length;
        
        for (let j = 0; j < dataLength; j++)
        {
            // update path
            d3.selectAll("#path" + i)
              .transition()
              .duration(200)
              .attr("d", lineGen(data[i]));

            // update labels next to line
            g.selectAll("#label" + i)
                .attr("x", xScale(d3.max(
                           data[i].map(d => { return d.key; } )))
                     )
                .attr("y", yScale(data[i][dataLength-1].value)-8)
                .text(data[i][i].name);

            // update databox
            var rect = g.selectAll("#databox" + data[i][j].key);
            
            // update circles
            rect.selectAll("#circle" + i)
                .attr("cx", xScale(data[i][j].key))
                .attr("cy", yScale(data[i][j].value));
            
            // update rects
            rect.selectAll("#rect" + i)
                .attr("x", xScale(data[i][j].key))
                .attr("y", yScale(data[i][j].value)); 
        
            // update text period
            rect.selectAll("#text" + i)
                .attr("x", xScale(data[i][j].key))
                .attr("y", yScale(data[i][j].value))
                .text("Period: " + data[i][j].key);

            // update text value
            rect.selectAll("#text" + i + j)
                .attr("x", xScale(data[i][j].key))
                .attr("y", yScale(data[i][j].value))
                .text("Value: " + data[i][j].value);   
        }
    }
}
