/ Load Data from Sharepoint REST API via AJAX

var requestUri = "https://iconnect.intra.mci.gov.sg/commonroom/GCCDashBoard/_api/Web/Lists/getbytitle('ProjectStatusUpdateList')/items?$filter=Pentest eq 'Inhouse'";

$.ajax({

              url: requestUri,

              type: "GET",

              headers: { "ACCEPT": "application/json;odata=verbose" },

              success: function(response){

                             loadList(response.d.results);

              },

              error: function () {

                             alert("Failed to get details");             

              }

});

 

 

// Function called by AJAX to load the results

function loadList(loadData){    

 

              // Set the date parsing formats

              // var fullDateFormat = d3.time.format('%d/%m/%Y');

 

              //var parseFormat = d3.time.format.iso.parse;

              //var dateFormat = d3.time.format('%d/%m/%Y');

              // Variable for last modified date

              var lastModified;

              // Convenience function to check null

              function checkIfZero(value) {

                             return value == 0 ? "1" : value;

              }

function checkIfDateIsNil(value) {

                             return value == null ? "00.00.00T" : value;

              }

 

// Convenience function to split the date

              function splitDate(value) {

 

var date = new Date(value);

 

var year = date.getFullYear();

var month = date.getMonth()+1;

var day = date.getDate();

 

if (day < 10) {

  day = '0' + day;

}

if (month < 10) {

  month = '0' + month;

}

 

var formattedDate = day + '/' + month + '/' + year

 

var splittedDate = formattedDate.split('T')[0].toLowerCase().trim();

 

                             return splittedDate;

              }

 

var userName = $().SPServices.SPGetCurrentUser({

fieldName: "Title",

debug :false

});

//console.log(userName);

 

var logInUserName = userName.split('(')[0].toLowerCase().trim();

 

           

              // Process each data element

              loadData.forEach(function (d) {

 

                             d.ProjectID = d.Project_x0020_ID;

                             d.ProjectName = d.Project_x0020_Name;

                             d.Agency = d.Title;

                             d.ResourceName = d.Resource_x0020_Names;

                             d.StartDate = splitDate(d.Start_x0020_Date);

                             d.EndDate = splitDate(d.End_x0020_Date);

                                                var ptDateTemp = checkIfDateIsNil(d.Estimated_x0020_PT_x0020_Date);

                                                d.PtDate = splitDate(ptDateTemp);

                             d.Approach = d.Approach;

                             d.Effort = d.Effort_x0028_Man_x0020_Months_x0;

                             d.StatusUpdate = d.Status_x0020_Update;

                             d.PhaseUpdate = d.Phase_x0020_Update;

                             d.Group = d.Group;

                             d.PercentageCompleted = checkIfZero(d.Percentage_x0020_Completed);//d.Percentage_x0020_Completed;

                             d.ProjectStatus = d.Project_x0020_Status;

                             d.Pentest = d.Pentest;

                             d.AD = d.AD;

                             d.SDC = d.SDC;

                                                d.ID = d.ID;

 

                             var members = [];

                             if (d.Members != null)

                             {

                                           d.Members.results.forEach(function (mem)

 

                                           {                          

                                                          //console.log(mem);

                                                         

                                                          members.push(mem);

                                           });

                             }

                             d.Members = members;

 

                           

                             d.count = +d.count;

                });

 

//creating charts

        var dataTable = dc.dataTable('#data-table');

 // Function to remove empty bins

              function remove_empty_bins(source_group) {

                             return {

                                           all:function() {

                                                          return source_group.all().filter(function(d) {

                                                                        return d.key != "";

                                                          });

                                           }

                             };

              }

              // Function to remove empty bins for dimensions

              function remove_empty_bins_dim(source_dim, type) {

                             return {

                                           top: function(n) {

                                                          return source_dim.bottom(Infinity)

                                                                        .filter(function(d) {

                                                                                      return d[type] != "";

                                                                        })

                                                                        .slice(0, n);

                                           },

                                           bottom: function(n) {

                                                          return this.top(Infinity).slice(-n).reverse();

                                           },

                                           size: function(n) {

                                                          return loadData.filter(function(v) {

                                                                        return v[type] != ""

                                                                        }).length;

                                           },

                                           value: function(n) {

                                                          return source_dim.top(Infinity).filter(function(d) {

                                                                        return d[type] != "";

                                                          }).length;

                                           },

                             };

              }

  //set crossfilter

        var ndx = crossfilter(loadData);

        //create dimensions (x-axis values)

        var allDim = ndx.dimension(function(d) {return d;});

 

        //data table

        dataTable

            .dimension(allDim)

            .group(function (d) { return 'dc.js insists on putting a row here so I remove it using js'; })

                  .size(Infinity)

           .columns([

                //function (d) { return d.ProjectID; },

                function (d) { return d.ProjectName; },

                function (d) { return d.Agency; },

                function (d) { return d.Group; },

                function (d) { return d.Approach; },

                //function (d) { return d.AD; },

                function (d) { return d.ResourceName; },

                function (d) { return d.StartDate; },

                function (d) { return d.EndDate; },

                function (d) { return d.PtDate; },

                function (d) { return d.PercentageCompleted; },

                function (d) { return d.ProjectStatus; },

                /*function (d) { var link = "https://iconnect.intra.mci.gov.sg/commonroom/GCCDashBoard/Lists/ProjectStatusUpdateList/DispForm.aspx?ID=" + d.ID;

 

                                                          if(d.ResourceName.toLowerCase().trim() == logInUserName)

 

                                                                        {

                                                          link = "https://iconnect.intra.mci.gov.sg/commonroom/GCCDashBoard/Lists/ProjectStatusUpdateList/EditForm.aspx?ID=" + d.ID;                                                  

 

                                                          }

 

                                                          return '<a target="_blank"; href="' + link + '">Click to Expand</a>';}*/

            ])

            .sortBy(function (d) { return d.PercentageCompleted; })

            .order(d3.descending)

            .on('renderlet', function (table) {

 

//each time table is rendered remove extra row dc.js insists on adding

               table.select('tr.dc-table-group').remove();

 

     // create jQuery DataTable

     var jqtable = $('#data-table').dataTable();

       

});

        d3.selectAll('a#all').on('click', function() {

            dc.filterAll();

            dc.renderAll();

        });

        d3.selectAll('a#group').on('click', function() {

            groupChart.filterAll();

            dc.redrawAll();

        });

        d3.selectAll('a#approach').on('click', function() {

            approachChart.filterAll();

            dc.redrawAll();

        });

        d3.selectAll('a#manmonth').on('click', function() {

            manmonthChart.filterAll();

            dc.redrawAll();

        });

             d3.selectAll('a#projectNamwCountChart').on('click', function() {

            projectNamwCountChart.filterAll();

            dc.redrawAll();

        });

             d3.selectAll('a#dataTable').on('click', function() {

            dataTable.filterAll();

            dc.redrawAll();

        });

        dc.renderAll();

        //d3.select(self.frameElement).style("height", height + "px");

 

 

  

}
