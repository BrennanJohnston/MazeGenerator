var rm_width = 801;
var rm_height = 801;
var block_width = 20;
var block_height = 20;
var fr = 60;
var wait_after_finish = 3 * fr;

var bias = 0; //0 for none, 1 for horizontal bias, 2 for vertical bias
var bias_weight = 60; //0 - 100 (percentage);
var rand_bias = true;
var rand_bias_timer = -1;//Math.floor(random(3*fr, 6*fr));
var wait_timer = wait_after_finish;
var grid_width = Math.floor(rm_width / block_width);
var grid_height = Math.floor(rm_height / block_height);
var cell_grid = [];
var _cur_block;
var visited_count = 0;
var max_visits = grid_width * grid_height;
var visit_stack = [];

var norm_bias_button = document.createElement("BUTTON");
var hori_bias_button = document.createElement("BUTTON");
var vert_bias_button = document.createElement("BUTTON");
var rand_bias_button = document.createElement("BUTTON");
norm_bias_button.innerHTML = "No Bias (Equal Randomization)";
hori_bias_button.innerHTML = "Horizontal Bias";
vert_bias_button.innerHTML = "Vertical Bias";
rand_bias_button.innerHTML = "Random Bias";

function setup() {
  createCanvas(rm_width, rm_height);
  frameRate(fr);
  norm_bias_button.onclick = function() {bias = 0; rand_bias = false; wait_timer = wait_after_finish; cell_grid = []; setup();};
  hori_bias_button.onclick = function() {bias = 1; rand_bias = false; wait_timer = wait_after_finish; cell_grid = []; setup();};
  vert_bias_button.onclick = function() {bias = 2; rand_bias = false; wait_timer = wait_after_finish; cell_grid = []; setup();};
  rand_bias_button.onclick = function() {rand_bias = !rand_bias;  wait_timer = wait_after_finish; cell_grid = []; setup();};
  document.body.appendChild(norm_bias_button);
  document.body.appendChild(hori_bias_button);
  document.body.appendChild(vert_bias_button);
  document.body.appendChild(rand_bias_button);
  visit_stack = [];
  
  //make all the cell objects
  for(var i = 0; i < grid_height; i++) {
    var new_row = [];
    for(var k = 0; k < grid_width; k++) {
      var new_block = new Block(k*block_width, i*block_height);
      new_row.push(new_block);
      new_block.draw();
    }
    cell_grid.push(new_row);
  }
  
  //assign neighbor values
  for(var i = 0; i < grid_height; i++) {
    for(var k = 0; k < grid_width; k++) {
      var cur_block = cell_grid[k][i];
      if(i > 0)
        cur_block.neighbors[0] = cell_grid[k][i-1];
      if(i < grid_height-1)
        cur_block.neighbors[2] = cell_grid[k][i+1];
      if(k > 0)
        cur_block.neighbors[3] = cell_grid[k-1][i];
      if(k < grid_width-1)
        cur_block.neighbors[1] = cell_grid[k+1][i];
    }
  }
  
  var rand_x = Math.floor(random(0, grid_width));
  var rand_y = Math.floor(random(0, grid_height));
  var edge = Math.floor(random(0, 4+1));
  var coords = [0, 0];
  if(edge == 0) { //up
    coords[0] = rand_x;
    coords[1] = 0;
  }
  else if(edge == 1) { //right
    coords[0] = grid_width-1;
    coords[1] = rand_y;
  }
  else if(edge == 2) { //down
    coords[0] = rand_x;
    coords[1] = grid_height-1;
  }
  else if(edge == 3) { //left
    coords[0] = 0;
    coords[1] = rand_y;
  }
  
  //_cur_block = cell_grid[Math.floor(random(0,grid_width))][Math.floor(random(0,grid_height))];
  _cur_block = cell_grid[coords[0]][coords[1]];
  _cur_block.visited = true;
  _cur_block.fill_col = 'white';
  visited_count++;
  _cur_block.draw();
}

function draw()
{
  //background(55);
  if(rand_bias) {
    if(rand_bias_timer <= 0) {
      bias = Math.floor(random(1, 2+1));
      rand_bias_timer = Math.floor(random(1*fr, 3*fr));
    }
    else
      rand_bias_timer--;
  }
  
  if(visited_count < max_visits)
  {
    //check if _cur_block has any unvisited neighbors
    var unvisited_neighbors = [];
    for(var i = 0; i < _cur_block.neighbors.length; i++)
    {
      if(_cur_block.neighbors[i] != -1 && _cur_block.neighbors[i].visited == false)
      {
        unvisited_neighbors.push(_cur_block.neighbors[i]);
      }
    }
    
    if(unvisited_neighbors.length > 0)
    {
        //randomly choose one of the neighbors if it does
       var rand_ind = Math.floor(random(0, unvisited_neighbors.length));
       var next_block = unvisited_neighbors[rand_ind];
      
       if(bias == 1) { //horizontal bias
         if((_cur_block.neighbors[0] != -1 && _cur_block.neighbors[0].visited == false) || (_cur_block.neighbors[2] != -1 && _cur_block.neighbors[2].visited == false)) {
           var pick_hori = Math.floor(random(0, 100));
           if(pick_hori < bias_weight) {
             var pick_a_block = [];
             if(_cur_block.neighbors[0] != -1 && _cur_block.neighbors[0].visited == false)
               pick_a_block.push(_cur_block.neighbors[0]);
             if(_cur_block.neighbors[2] != -1 && _cur_block.neighbors[2].visited == false)
               pick_a_block.push(_cur_block.neighbors[2]);
             next_block = pick_a_block[Math.floor(random(0, pick_a_block.length))];
           }
         }
       }
       else if(bias == 2) { //vertical bias
         if((_cur_block.neighbors[1] != -1 && _cur_block.neighbors[1].visited == false)|| (_cur_block.neighbors[3] != -1 && _cur_block.neighbors[3].visited == false)) {
           var pick_vert = Math.floor(random(0, 100));
           if(pick_vert < bias_weight) {
             var pick_a_block = [];
             if(_cur_block.neighbors[1] != -1 && _cur_block.neighbors[1].visited == false)
               pick_a_block.push(_cur_block.neighbors[1]);
             if(_cur_block.neighbors[3] != -1 && _cur_block.neighbors[3].visited == false)
               pick_a_block.push(_cur_block.neighbors[3]);
             next_block = pick_a_block[Math.floor(random(0, pick_a_block.length))];
           }
         }
       }
      
       var dest_wall = -1;
       if(next_block.x > _cur_block.x)
         dest_wall = 1;
       else if(next_block.x < _cur_block.x)
         dest_wall = 3;
       else if(next_block.y > _cur_block.y)
         dest_wall = 2;
       else
         dest_wall = 0;
      
       //push current cell to the stack
       visit_stack.push(_cur_block);
       //remove wall from _cur_block and new cell
        
       _cur_block.walls[dest_wall] = 0;
       dest_wall += 2;
       if(dest_wall >= 4)
         dest_wall = dest_wall % 4;
       next_block.walls[dest_wall] = 0;
       //make chosen cell _cur_block and mark it as visited
       _cur_block.fill_col = 'yellow';
       _cur_block.draw();
       _cur_block = next_block;
       _cur_block.visited = true;
       _cur_block.fill_col = 'white';
       _cur_block.draw();
    }
    //else if stack is NOT empty
    else if(visit_stack.length > 0)
    {
       //pop a cell from the stack
       var next_block = visit_stack.pop();
       //make it the _cur_block
       _cur_block.fill_col = 'green';
       _cur_block.draw();
       _cur_block = next_block;
    }
    else //maze finished
    {
      if(wait_timer <= 0)
      {
        wait_timer = wait_after_finish;
        cell_grid = [];
        setup();
      }
      else
        wait_timer--;
    }
  }
  //draw the blocks
  /*for(var i = 0; i < grid_height; i++)
  {
    for(var k = 0; k < grid_width; k++)
    {
      var cur_block = cell_grid[k][i];
      //cur_block.draw();
    }
  }*/
}

function Block(xx, yy) {
  this.x = xx;
  this.y = yy;
  this.width = block_width;
  this.height = block_height;
  this.walls = [1,1,1,1]; //up, right, down, left :::: 1 = has wall, 0 = no wall
  this.neighbors = [-1,-1,-1,-1];
  this.wall_col = 'black';
  this.fill_col = 'red';
  this.visited = false;
  
  this.draw = function() {
    stroke(this.fill_col);
    fill(this.fill_col);
    rect(this.x, this.y, this.width, this.height);
    stroke(this.wall_col);
    for(var i = 0; i < this.walls.length; i++) {
      if(this.walls[i] == 1) {
        if(i == 0) //top
          line(this.x, this.y, this.x+this.width, this.y);
        else if(i == 1) //right
          line(this.x+this.width, this.y, this.x+this.width, this.y+this.height);
        else if(i == 2) //bottom
          line(this.x, this.y+this.height, this.x+this.width, this.y+this.height);
        else if(i == 3) //left
          line(this.x, this.y+this.height, this.x, this.y);
      }
    }
  }
}