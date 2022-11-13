namespace reversi {

    enum Player {
        BLACK,
        WHITE,
        NONE
    }


    const COL_MAX = 8;
    const COL_MIN = 1;

    const ROW_MAX = 7;
    const ROW_MIN = 0;

    let currentPlayer = Player.BLACK;

    function isBlackTurn() {
        return currentPlayer == Player.BLACK;
    }

    function opponent(player:Player) {
        if (player == Player.BLACK) {
            return Player.WHITE
        } else if (player == Player.WHITE){
            return Player.BLACK
        } else {
            return Player.NONE
        }
    }

    function switchPlayer() {
        if (isBlackTurn()) {
            currentPlayer = Player.WHITE;
            cursor.setImage(assets.image`whiteCursor`)
        } else {
            currentPlayer = Player.BLACK;
            cursor.setImage(assets.image`blackCursor`)
        }
        
    }

    function reversiImpl(column: number, row: number, direction: number[], player:Player): number {
        if (row < ROW_MIN || row > ROW_MAX || column < COL_MIN || column > COL_MAX) {
            return 0;
        } 
    
        let tilePiece = tileAt(column, row)
        if (tilePiece == player) {
            return 1;
        } else if (tilePiece == Player.NONE) {
            return 0;
        } else {
            let ret = reversiImpl(column + direction[0], row + direction[1], direction, player)
            if (ret == 0) {
                return 0;  
            } 

            update(column, row, player)
            return ret + 1
        }
    }

    const adjacencies = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    function reversi(row:number, column:number, player:Player) :boolean{
        let validReversi = false;
        for (let adjacency of adjacencies) {
            if (tileAt(column + adjacency[0], row + adjacency[1]) == opponent(player)) {
                let score = reversiImpl(column + adjacency[0], row + adjacency[1], adjacency, player)
                if (score != 0) {
                    validReversi = true
                    flipPiecesBy(score - 1);
                }
                
            }
        }
        return validReversi;
    }

    function flipPiecesBy(score:number) {
        if (isBlackTurn()) {
            info.player1.changeScoreBy(score)
            info.player2.changeScoreBy(-score)
        } else {
            info.player2.changeScoreBy(score)
            info.player1.changeScoreBy(-score)
        }
    }

    function updateCurrentPlayerScoreBy(score:number) {
        if (isBlackTurn()) {
            info.player1.changeScoreBy(score)
        } else {
            info.player2.changeScoreBy(score)
        }
    }

    function tryToPlace() :boolean {
        let loc = tiles.locationOfSprite(cursor)
        if (tiles.getTileAt(loc.column, loc.row) == sprites.dungeon.floorLight2
            && reversi(loc.row, loc.column, currentPlayer)) {
            //TODO should check whether can reversi
            place()
            return true;
        } else {
            return false;
        }
        
    }

    function tileAt(column:number, row:number) : Player {
        if (tiles.getTileAt(column, row).equals(assets.tile`blackPiece`)) {
            return Player.BLACK
        } else if (tiles.getTileAt(column, row).equals(assets.tile`whitePiece`)) {
            return Player.WHITE
        } else {
            return Player.NONE
        }

    }

    function update(column:number, row:number, player:Player) {
        if (player == Player.WHITE) {
            tiles.setTileAt(tiles.getTileLocation(column, row), assets.tile`whitePiece`);
        } else {
            tiles.setTileAt(tiles.getTileLocation(column, row), assets.tile`blackPiece`);
        }   
    }

    function place() {
        if (currentPlayer != Player.NONE) {
            tiles.setTileAt(tiles.locationOfSprite(cursor), isBlackTurn() ? assets.tile`blackPiece` : assets.tile`whitePiece`);
            updateCurrentPlayerScoreBy(1)
        }
    }

    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        if (tryToPlace()) {
            switchPlayer()
        } else {
            scene.cameraShake();
        }
        
    })

    controller.up.onEvent(ControllerButtonEvent.Pressed, function() {
        let loc = tiles.locationOfSprite(cursor);
        if (loc.row != ROW_MIN) {
            tiles.placeOnTile(cursor, tiles.getTileLocation(loc.col, loc.row - 1))
        }
    })
    controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
        let loc = tiles.locationOfSprite(cursor);
        if (loc.row != ROW_MAX) {
            tiles.placeOnTile(cursor, tiles.getTileLocation(loc.col, loc.row + 1))
        }
    })
    controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
        let loc = tiles.locationOfSprite(cursor);
        if (loc.col != COL_MIN) {
            tiles.placeOnTile(cursor, tiles.getTileLocation(loc.col - 1, loc.row))
        }
    })
    controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
        let loc = tiles.locationOfSprite(cursor);
        if (loc.col != COL_MAX) {
            tiles.placeOnTile(cursor, tiles.getTileLocation(loc.col + 1, loc.row))
        }
    })
    tiles.setCurrentTilemap(tilemap`级别`)
    let cursor = sprites.create(assets.image`blackCursor`, SpriteKind.Player)
    tiles.placeOnTile(cursor, tiles.getTileLocation(5,5))

    scene.cameraFollowSprite(cursor)
    info.player1.setScore(2)
    
    info.player2.setScore(2)

    info.player1.border = 15
    info.player1.bg = 15
    info.player1.fc = 1

    info.player2.border = 1
    info.player2.bg = 1
    info.player2.fc = 15
}
