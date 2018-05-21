/* 
 * Student name: Civio Arts
 * Student number: 11043946
 * Assignment 5: Linked Views
 */
window.onload = function()
{
    // define global variables because it will be used my multiple functions
    // like margin, width, height and gender (to switch between datasets)
    // colors by colorbrewer.org
    var margin = {top: 80, right: 50, bottom: 40, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        colorRange = {"male": "#2b8cbe", "female":"#045a8d"},
        colorRange2 = {"male":"#feb24c","female":"#fd8d3c"},
        gender = "male",
        originalData = [],       // for backup and update
        originalData2 = [];      // for backup and update countries

        // define buttons for country change
        document.getElementById("nl").onclick = function() { updateCountry("nl") };
        document.getElementById("be").onclick = function() { updateCountry("be") };
        document.getElementById("lux").onclick = function() { updateCountry("lux") };
        
        // import and load files
        queue()
            .defer(d3.json, "data.json")
            .defer(d3.json, "data2.json")
            .await(generateData);

    // generates country data
    function generateData(error, data, data2, country)   
    {
        // check for errors
        if (error)
            throw error;
        
        originalData = data;
        originalData2 = data2;
        
        // define NL data
        var periodNL = Object.keys(data2[0].NL.male);
        var maleNL = Object.values(data2[0].NL.male);
        var femaleNL = Object.values(data2[0].NL.female);
        
        // define BE data
        var periodBE = Object.keys(data2[0].BE.male);
        var maleBE = Object.values(data2[0].BE.male);
        var femaleBE = Object.values(data2[0].BE.female);
        
        // define LUX data
        var periodLUX = Object.keys(data2[0].LUX.male);
        var maleLUX = Object.values(data2[0].LUX.male);
        var femaleLUX = Object.values(data2[0].LUX.female);

        // define countries
        var countries = {   "nl":[{male:[], female:[]}],
                            "be":[{male:[], female:[]}],
                            "lux":[{male:[], female:[]}]
                        };
        
        // define arrays for objects
        for (let i = 0; i < periodNL.length; i++)
        {   
            // define netherlands object
            countries.nl[0].male.push({ "period":+periodNL[i], "sex":"male", 
                "expected":+maleNL[i] });            
            countries.nl[0].female.push({ "period":+periodNL[i], "sex":"female", 
                "expected":+femaleNL[i] });
            
            // define belgium object
            countries.be[0].male.push({ "period":+periodBE[i], "sex":"male", 
                "expected":+maleBE[i] });            
            countries.be[0].female.push({ "period":+periodBE[i], "sex":"female", 
                "expected":+femaleBE[i] });
    
            // define luxembourg object
            countries.lux[0].male.push({ "period":+periodLUX[i], "sex":"male", 
                "expected":+maleLUX[i] });            
            countries.lux[0].female.push({ "period":+periodLUX[i], 
                "sex":"female", "expected":+femaleLUX[i] });
        }
        
        originalData2 = countries;
        createGraph(data, countries, country);
    }
    
    // create the graph
    function createGraph(data, data2, country)
    {     
        // restore data2 (for use after country update)
        data2 = originalData2;
        
        // check which country is selected, if unidentified then itś the
        // netherlands
        if(country == "lux")
            data2 = data2.lux;
        else if(country == "be")
            data2 = data2.be;
        else
            data2 = data2.nl;
        
        // create graph for average age in population and life expectancy
        graphPopulation(data, data2);
        graphExpected(data2);
    }

    // create graph for the population
    function graphPopulation(data, data2)
    {   
        // re-define button text
        document.getElementById("color").innerHTML = "CHANGE COLOR";
                     
        // add click functionality to button
        var button = document.getElementById("color")
                             .addEventListener("click", changeColor);
        
        // select svg with population id
        var svg = d3.select("#population");
        
        // append title to svg
        svg.append("text")
            .attr("class", "title")
            .attr("x", "35%")
            .attr("y", 30)
            .text("AVERAGE AGE PER GENDER");
        
        // append source notation
        svg.append("text")
            .text("source: CBS")
            .attr("x", "46%")
            .attr("y", 50);
        
        // append g-element en define position
        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," 
                    + margin.top + ")");

        // define scaling for x-axis
        var x0 = d3.scaleBand()
                   .rangeRound([0, width])
                   .paddingInner(0.1);

        var x1 = d3.scaleBand()
                   .padding(0.05);

        // define scaling for y-axis
        var y = d3.scaleLinear()
                  .rangeRound([height, 0]);

        // define colors
        var z = d3.scaleOrdinal()
                  .range(Object.values(colorRange));

        // define keys of data object (names for legend)
        var keys = Object.keys(data[0]).slice(1);

        // define domains for x-axis and y-axis
        x0.domain(data.map(d => d.period));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, d => { return d3.max(keys, key => 
                { return d[key]; }); })]).nice();
        
        // append g-element to create bars and put them at the right position
        g.append("g")
          .selectAll("g")
          .data(data)
          .enter().append("g")
          .attr("transform", d => { 
              return "translate(" + x0(d.period) + ",0)"; 
              })
          .selectAll("rect")
          .data(d => { let period = d.period; return keys.map(key => { 
                  return { "key": key, "value": d[key], "period":period}; });
                })
          .enter().append("rect")
           .attr("class", d => {return ("bar " + d.key)})
           .attr("x", d => { return x1(d.key); })
           .attr("y", d => { return y(d.value); })
           .attr("width", x1.bandwidth())
           .attr("height", d => { return height - y(d.value); })
           .on("click", d => { 
                    d3.select("#value_text")
                      .text("Period: " + d.period + " | " + 
                            "Value: " + d.value + " | " + 
                            "Gender: " + d.key);
                    
                    gender = d.key; update(data2); });
           

        // create  x-axis
        g.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x0))
          .append("text")
          .attr("x", width / 2)
          .attr("y", 35)
          .attr("fill", "#000")
          .text("PERIOD");

        // create y-axis
        g.append("g")
          .call(d3.axisLeft(y).ticks(null, "s"))
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -40)
          .attr("x", -(height / 3))
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .attr("fill", "#000")
          .text("AVERAGE AGE IN POPULATION (years)");

        // create legend
        var legend = g.append("g")
                       .attr("class", "legend")
                       .attr("text-anchor", "end")
                       .selectAll("g")
                       .data(keys)
                       .enter().append("g")
                       .attr("transform", (d, i) => {
                               return "translate(0," + i * 20 + ")"; 
                           });
 
        // append (colored) boxes for elements in data
        legend.append("rect")
               .attr("class", (d,i) => {return keys[i];})
               .attr("x", width + 35)
               .attr("width", 13)
               .attr("height", 13);

        // append names to legend-elements
        legend.append("text")
               .attr("x", width + 30)
               .attr("y", 8)
               .attr("dy", "0.32em")
               .text(d => { return d; });
    }

    // create graph for life expectancy
    function graphExpected(data)
    {
        // backup original data
        var originalData = data;
   
        // define new data
        data = data[0][gender];
        
        // select svg
        var svg = d3.select("#expected");

        // scale x
        var x = d3.scaleBand()
                  .rangeRound([0, width])
                  .padding(0.1),
        
        // scale y
            y = d3.scaleLinear()
                  .rangeRound([height, 0]);

        // append title
        svg.append("text")
            .attr("x", "37%")
            .attr("y", 20)
            .attr("class", "title")
            .text(gender.toUpperCase() + "'S LIFE EXPECTANCY");
        
        // append source notation
        svg.append("text")
            .text("source: CBS")
            .attr("x", "46.5%")
            .attr("y", 50);

        // append element for extra graphics
        var g = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," 
                            + margin.top + ")");

        // define domains
        x.domain(data.map(d => { return d.period; }));
        y.domain([d3.min(data, d => { return Math.floor(d.expected); }), 
                  d3.max(data, d => { return Math.ceil(d.expected); })]);

        // create x-axis
        g.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .append("text")
          .attr("x", width / 2)
          .attr("y", 35)
          .attr("fill", "#000")
          .text("PERIOD");

        // create y-axis
        g.append("g")
          .attr("class", "axis_y")
          .call(d3.axisLeft(y))
          .append("text")
          .attr("id", "life_title")
          .attr("transform", "rotate(-90)")
          .attr("y", -40)
          .attr("x", -(height / 3))
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .attr("fill", "#000")
          .text("LIFE EXPECTANCY (years)");

        // create bars
        g.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .on("click", d => {
              update(originalData);
          })
          .attr("class", "bar " + data[0].sex) 
          .attr("x", d => { return x(d.period); })
          .attr("y", d => { return y(d.expected); })
          .attr("width", x.bandwidth())
          .attr("height", d => {
              return height - y(d.expected);
          });
    };

    // updates chart
    function update(data)
    {
        // define the right data
        data = data[0][gender];
        
        // define variables to be used
        var svg = d3.select("#expected");
        var bar = d3.selectAll(".bar").data(data);

        // define x-scale
        var x = d3.scaleBand()
                  .rangeRound([0, width])
                  .padding(0.1);
        
        // define y-scale
            y = d3.scaleLinear()
                  .rangeRound([height, 0]);
          
        // define new domains
        x.domain(data.map(d => { return d.period; }));
        y.domain([d3.min(data, d => { return Math.floor(d.expected); }), 
                  d3.max(data, d => { return Math.ceil(d.expected); })]);


        // update x-axis
        svg.select(".axis_x")
           .call(d3.axisBottom(x));

        // update y-axis
        svg.select(".axis_y")
           .call(d3.axisLeft(y));

        // update svg title
        svg.select(".title")
           .text(gender.toUpperCase() + "'S LIFE EXPECTANCY");
        
        // change bar data
        bar.attr("x", d => { return x(d.period); })
           .attr("y", d => { return y(d.expected); })
           .attr("width", x.bandwidth())
           .attr("height", d => {
               return height - y(d.expected);
           })
           .attr("class", "bar " + gender)
           .attr("style", "fill:" + colorRange[gender]);
   
        // change gender to opposite
        if(gender == "female")
            gender = "male"
        else
            gender = "female"
    }
    
    // changes time between year-range and current year
    function changeColor()
    {
        // backup colorRange(2) values
        let temp = colorRange;
        colorRange = colorRange2;
        colorRange2 = temp;
        
        // get female bars and male bars
        var bars = d3.selectAll(".female");
        var bars2 = d3.selectAll(".male");
        
        // change female bars color
        for (let bar of bars._groups[0])
            bar.setAttribute("style", "fill:" + colorRange.female);
        
        // change male bars color
        for (let bar of bars2._groups[0])
            bar.setAttribute("style", "fill:" + colorRange.male);
    }
    
    // changes country selected
    function updateCountry(country)
    {        
        // delete all svg's
        var svg = d3.selectAll("svg").empty();
        d3.selectAll("g").remove();
        d3.selectAll("text").remove();
        
        // create new Graph
        createGraph(originalData, originalData2, country);
    }
};
