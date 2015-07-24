 /*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    $('.results').delegate('.delete', 'touchend', function() {
      app.deleteTodo($(this).closest('li').data('todo_id'));
    });

    $('#todo').keypress(function (e) {
      var key = e.which;
      if(key == 13) {
        addTodo();
      }
    });

    $('#addButton').on('touchend', function() {
      addTodo();
    })
  },

  onDeviceReady: function() {
    app.openDb();
    app.createTable();
    app.refresh();
  }
};

app.db = null;
      
app.openDb = function() {
   var dbName = "Todo.sqlite";
   if (window.navigator.simulator === true) {
        // For debugin in simulator fallback to native SQL Lite
        console.log("Use built in SQL Lite");
        app.db = window.openDatabase(dbName, "1.0", "Cordova Demo", 200000);
    }
    else {
        app.db = window.sqlitePlugin.openDatabase(dbName);
    }
}
      
app.createTable = function() {
  var db = app.db;
  db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on DATETIME)", []);
  });
}
      
app.addTodo = function(todoText) {
  var db = app.db;
  db.transaction(function(tx) {
    var addedOn = new Date();
    tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)",
            [todoText, addedOn],
            app.onSuccess,
            app.onError);
  });
}
      
app.onError = function(tx, e) {
  console.log("Error: " + e.message);
} 
      
app.onSuccess = function(tx, r) {
  app.refresh();
}
      
app.deleteTodo = function(id) {
  var db = app.db;
  db.transaction(function(tx) {
    tx.executeSql("DELETE FROM todo WHERE ID=?", [id], app.onSuccess, app.onError);
  });
}

app.refresh = function() {

  var renderTodo = function (row) {
    $li = $('<li>').addClass("list-group-item").data('todo_id', row.ID);
    $li.html($('.todo-item-template').clone().html());
    $li.find('.text-holder').text(row.todo);
    return $li;
  }
  
  var render = function (tx, rs) {
    $todoItems = $("#todoItems");
    $todoItems.empty();
    for (var i = 0; i < rs.rows.length; i++) {
      $todoItems.append(renderTodo(rs.rows.item(i)));
    }
    $todoItems;
  }
  
  var db = app.db;
  db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM todo", [], render, app.onError);
  });
}

function addTodo() {
  var todo = $("#todo");
  app.addTodo(todo.val());
  todo.val("");
}

app.initialize();