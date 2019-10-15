// @TODO: YOUR CODE HERE!
function makeResponsive() {
    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
      svgArea.remove();
    }
var svgWidth = window.innerWidth*0.8;
var svgHeight = svgWidth*0.55;
// size changed per window size
var circleR = svgWidth*0.011; 
var textsize = parseInt(svgWidth*0.009);
var margin = {
  top: 30,
  right: 50,
  bottom: 100,
  left: 90
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
// svg
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
// parameters
var chosenXAxis = "poverty";
var chosenYAxis ="healthcare";
function xScale(censusData, chosenXAxis) {
 
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * .7,
      d3.max(censusData, d => d[chosenXAxis]) * 1.3])
    .range([0, width]);
  return xLinearScale;
}



function yScale(censusData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * .7,
      d3.max(censusData, d => d[chosenYAxis]) * 1.0])
    .range([height, 0]);
  return yLinearScale;
}
function renderCircles(circlesGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
function renderText(textGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
    
  return textGroup;
}
function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([70, -70])
    .html(function(d) {
      if (chosenXAxis === "income"){
        return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]} USD<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
    
      } else if (chosenXAxis === "age"){
        return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
      }    
      else {
        return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}%<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
      }
      });
      
     
  circlesGroup.call(toolTip);
  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d,this);
    })
    .on("mouseout", function(d, index) {
      toolTip.hide(d);
    });
  return circlesGroup;
}
d3.csv("assets/data/data.csv").then(function(censusData) {
  
  censusData.forEach(function(data) {
   
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.abbr = data.abbr;
  });
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", circleR)
    .attr("fill", "green");
  var textGroup = chartGroup.selectAll("text")
    .exit()
    .data(censusData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("font-size", textsize+"px")
    .attr("text-anchor", "middle")
    .attr("class","stateText");
  
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 30})`);
  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("class","axis-text-x")
    .attr("value", "poverty") 
    .classed("active", true)
    .text("In Poverty (%)");
  
  var ylabelsGroup = chartGroup.append("g");
  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
    .attr("dy", "1em")
    .attr("class","axis-text-y")
    .classed("axis-text", true)
    .attr("value", "healthcare") 
    .classed("active", true)
    .text("Without Healthcare (%)");
  
  labelsGroup.selectAll(".axis-text-x")
    .on("click", function() {
      
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;
        console.log(chosenXAxis)
        xLinearScale = xScale(censusData, chosenXAxis);
       
        yLinearScale = yScale(censusData, chosenYAxis);
        
        xAxis = renderXAxes(xLinearScale, xAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);
      }
    });
  ylabelsGroup.selectAll(".axis-text-y")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
      chosenYAxis = value;
      console.log(chosenYAxis)
     xLinearScale = xScale(censusData, chosenXAxis);
     
     yLinearScale = yScale(censusData, chosenYAxis);
     
     yAxis = renderYAxes(yLinearScale, yAxis);
     
     circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
     textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);
    }
  });
});
}
makeResponsive();
d3.select(window).on("resize", makeResponsive);