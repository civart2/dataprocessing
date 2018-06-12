/*
 *  Assignment: d3 Map
 *  Student: Civio Arts
 *  Studentnumber: 11043946
 */

window.onload = function()
{           
    // load datasets and call for processing
    queue()
	.defer(d3.json, "data.json")
        .defer(d3.json, "description.json")
	.await(designMap);
};

function processData(data)
{
    // declare new dataset
    var dataset = [];
    
    for(let element in data)
    {
        // get key (country) and value (corruption-index) 
        var key = data[element].code,
            value = data[element].value,
            corruption,
            color,
            obj = {};
    
        // set corruption level
        if(value < -0.5)
        {
            corruption = "Corrupt"
            color = "bad";
        }
        else if(value > 0.5)
        {
            corruption = "Not corrupt";
            color = "good";
        }
        else
        {
            corruption = "Neutral";
            color = "neutral";
        }
        
        // create object
        obj[key] = {"value":value, "corruption":corruption, "fillKey":color};
        
        // push object to dataset
        dataset.push(obj);
    }
    
    return dataset;
}

function getColor(data)
{
    // set color variable
    var color = {};  
    
    // get country codes    
    var countries = [];
    
    for (let country in data)
        countries.push(Object.keys(data[country]));
    
    // go through elements and countries to find corruption level
    for (let element in data)
    {
        for (let index in countries)
        {
            // get country
            let country = countries[index];
            
            if(typeof data[element][country] != "undefined")
            {
                color[country] = {fillKey: data[element][country].fillKey};
            }
        }
    }
    
    return color;
}

function designMap(error, data, description)
{
    // check for errors
    if (error)
        throw error;
    
    // assign title
    d3.select("body").insert("div","#container")
        .attr("class", "title")
        .text(description.name);
        
    // assign source
    d3.select("body").append("p")
                     .attr("class", "source")
                     .text("Source: World Data Bank | Description: " + 
                            description.definition);
    
    // process data
    data = processData(data);
    
    // get country color
    var color = getColor(data);
    
    // Getting the container's dimensions
    var width = document.getElementById('container').offsetWidth;
    var height = document.getElementById('container').offsetHeight;
    
    // create new map
    var map = new Datamap({
        element: document.getElementById('container'),
        geographyConfig: {
            borderColor: "#000",
            highlightBorderColor: "#FFF",
            highlightFillColor: '#F2F2F2',
            fillOpacity: 0.4,
            popupTemplate: function(geography) {
                for (element in data)
                {
                    if (typeof data[element][geography.id] != "undefined")
                        return "<div class='box'><strong>Country: " +
                                    geography.properties.name + "</strong>" +
                                    "<br><span>Value: </span>" +
                                    data[element][geography.id].value +
                                    "<br><span>Corruption: " +
                                    data[element][geography.id].corruption + 
                                    "</span></div>";
                }
            }
        },
        scope: 'world',
        fills: {
          good: "#ece2f0",
          neutral: "#a6bddb",
          bad: "#1c9099",
          defaultFill: '#FFF'      
        },
        data: color,                
        setProjection: function() {
            var projection, path;
            projection = d3.geo.mercator()
                    .translate([(width/2), (height/2)])      
                    .scale( width / 2 / Math.PI)
                    .center([-15.652173913043478, 17.2734596919573]);
            path = d3.geo.path()
               .projection( projection );
            return {path: path, projection: projection};
        }
    });
}
