

let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");
let path = require("path");

let homeLink = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595';

request(homeLink , cb); // moving to next page
function cb( error , response , html ){
    if( error ){
        console.log(error);
    }else if( response.statusCode == 404 ){
        console.log("Page Not Found");
    }else{
        allMatchPage(html);
    }
}

function allMatchPage( html ){
    //search tool to get all content of the site.
    let searchTool = cheerio.load(html);

    // css selector to select the element in content.
    let elementData = searchTool(".widget-items.cta-link");

    //getting ancher tag from the element selected.
    let anchertag = searchTool(elementData).find("a");
    //getting link from the ancher tag.
    let viewAllLink = anchertag.attr("href");


    // converting link to full link.
    let viewAllFullLink = `https://www.espncricinfo.com` + `${viewAllLink}` ;

    request( viewAllFullLink , cb2 ); // moving to next page

}


function cb2( error , response , html ){
    if( error ){
        console.log(error);
    }else if( response.statusCode == 404 ){
        console.log("Page Not Found");
    }else{
        matchesTables(html);
    }
}

function matchesTables(html){

    //get all content of site.
    let searchTool = cheerio.load(html);

    //css selector to select the element
    let elementDataArr = searchTool("a[data-hover='Scorecard']");
    for( let i = 0 ; i < elementDataArr.length ; i++ ){
        let link = searchTool(elementDataArr[i]).attr("href");
        let fullLinkMatch = `https://www.espncricinfo.com/${link}`;
        
        request( fullLinkMatch , cb3 );// moving to next page
        
    }

}

function cb3( error , response , html ){
    if( error ){
        console.log(error);
    }else if( response.statusCode == 404 ){
        console.log("Page Not Found");
    }else{
        stats(html);
    }
}

function stats(html){

    // get content of site
    let searchTool = cheerio.load(html);

    let bothInningArr = searchTool(".Collapsible");

    let matchinfo = searchTool(".match-info .description").text();
    let venue =  matchinfo.split(',')[1].trim();
    
    let date = matchinfo.split(',')[2].trim();
    

    //current path
    let currPath = process.cwd();
    


    for( let i = 0 ; i < bothInningArr.length ; i++ ){
        
        //Getting team name and modifying it.
        //team name is in the h5 tag inside table.
        let teamName = searchTool(bothInningArr[i]).find("h5");
        teamName = teamName.text();
        teamName = teamName.split("INNINGS")[0];
        teamName = teamName.trim();

        let opponentTeam = searchTool(bothInningArr[i == 0 ? 1 : 0]).find("h5");
        opponentTeam = opponentTeam.text();
        opponentTeam = opponentTeam.split("INNINGS")[0];
        opponentTeam = opponentTeam.trim();

        
        // getting all rows of batsman table
        let batsmanTableAllRows = searchTool( bothInningArr[i]).find(".table.batsman tbody tr");
        for( let j = 0 ; j < batsmanTableAllRows.length ; j++ ){
            let numbersofTDs = searchTool( batsmanTableAllRows[j]).find("td");
            if( numbersofTDs.length == 8 ){
                let playerName = searchTool( numbersofTDs[0]).text();
                
                let run = searchTool( numbersofTDs[2]).text();
                let balls = searchTool( numbersofTDs[3]).text();
                let fours = searchTool( numbersofTDs[5]).text();
                let six = searchTool( numbersofTDs[6]).text();
                let sr = searchTool( numbersofTDs[7]).text();

                
                if( !fs.existsSync( path.join( currPath , teamName ) ) ){
                    fs.mkdirSync( path.join( currPath , teamName ) );
                    let filepath = path.join( currPath , teamName , playerName ); 
                    let heading = "My Team Name\t Name\t Venue\t Date\t Opponent Team Name\t Runs\t Balls\t Fours\t Sixex\t SR\t"; 
                    let firstLine = "\n" + teamName + "\t" + playerName + "\t" + venue  + "\t" + date + "\t" + opponentTeam + "\t" + run + "\t" + balls + "\t" + fours + "\t" + six + "\t" + sr;
                    fs.writeFileSync( filepath , heading );
                    fs.appendFileSync( filepath , firstLine );

                }else{
                    if( !fs.existsSync( path.join( currPath , teamName , playerName ) ) ){
                        let filepath = path.join( currPath , teamName , playerName ); 
                        let heading = "My Team Name\t Name\t Venue\t Date\t Opponent Team Name\t Runs\t Balls\t Fours\t Sixex\t SR\t"; 
                        let firstLine = "\n" + teamName + "\t" + playerName + "\t" + venue  + "\t" + date + "\t" + opponentTeam + "\t" + run + "\t" + balls + "\t" + fours + "\t" + six + "\t" + sr;
                        fs.writeFileSync( filepath , heading );
                        fs.appendFileSync( filepath , firstLine );
                    }else{
                        let filepath = path.join( currPath , teamName , playerName );
                        let lines = "\n" + teamName + "\t" + playerName + "\t" + venue  + "\t" + date + "\t" + opponentTeam + "\t" + run + "\t" + balls + "\t" + fours + "\t" + six + "\t" + sr;
                        fs.appendFileSync( filepath , lines );
                        console.log( lines );
                    }
                }
            }
            
        }
    }
}


