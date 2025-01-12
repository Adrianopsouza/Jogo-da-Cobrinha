// Seleciona o elemento <canvas> e obtém o contexto 2D para desenhar
const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

// Seleciona os elementos relacionados à pontuação e menu
const score = document.querySelector(".score--value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")

// Carrega o áudio para ser reproduzido quando a cobra come a comida
const audio = new Audio("../assets/audio.mp3")

// Define o tamanho de cada segmento da cobra e da comida
const size = 30

// Define a posição inicial da cobra
const initialPosition = { x: 270, y: 240 }

// Inicia a cobra com um único segmento na posição inicial
let snake = [initialPosition]

// Função para incrementar a pontuação
const incrementScore = () => {
    score.innerText = +score.innerText + 10
}

// Gera um número aleatório entre um intervalo
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

// Gera uma posição aleatória válida no grid do canvas
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30
}

// Gera uma cor RGB aleatória
const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

// Define a comida com posição e cor aleatórias
const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

// Variáveis para direção e ID do loop
let direction, loopId

// Desenha a comida no canvas
const drawFood = () => {
    const { x, y, color } = food

    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

// Desenha a cobra no canvas
const drawSnake = () => {
    ctx.fillStyle = "#ddd"

    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = "white" // A cabeça da cobra é branca
        }

        ctx.fillRect(position.x, position.y, size, size)
    })
}

// Move a cobra na direção atual
const moveSnake = () => {
    if (!direction) return // Sai se a direção não foi definida

    const head = snake[snake.length - 1] // Obtém a posição da cabeça

    // Adiciona um novo segmento à frente, dependendo da direção
    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y })
    }

    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y })
    }

    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size })
    }

    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size })
    }

    snake.shift() // Remove o último segmento para manter o tamanho constante
}

// Desenha o grid no canvas para facilitar a visualização
const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919"

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

// Verifica se a cobra comeu a comida
const chackEat = () => {
    const head = snake[snake.length - 1] // Obtém a cabeça da cobra

    if (head.x == food.x && head.y == food.y) {
        incrementScore() // Incrementa a pontuação
        snake.push(head) // Adiciona um novo segmento à cobra
        audio.play() // Reproduz o áudio

        // Gera uma nova posição para a comida que não esteja sobre a cobra
        let x = randomPosition()
        let y = randomPosition()

        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor() // Gera uma nova cor para a comida
    }
}

// Verifica colisões com paredes ou consigo mesma
const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    // Verifica colisão com as bordas
    const wallCollision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    // Verifica colisão com o próprio corpo
    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    // Finaliza o jogo se houver colisão
    if (wallCollision || selfCollision) {
        gameOver()
    }
}

// Finaliza o jogo
const gameOver = () => {
    direction = undefined // Reseta a direção
    menu.style.display = "flex" // Mostra o menu de fim de jogo
    finalScore.innerText = score.innerText // Exibe a pontuação final
    canvas.style.filter = "blur(2px)" // Aplica um efeito visual no canvas
}

// Loop principal do jogo
const gameLoop = () => {
    clearInterval(loopId)

    ctx.clearRect(0, 0, 600, 600) // Limpa o canvas
    drawGrid() // Desenha o grid
    drawFood() // Desenha a comida
    moveSnake() // Move a cobra
    drawSnake() // Desenha a cobra
    chackEat() // Verifica se comeu a comida
    checkCollision() // Verifica colisões

    // Continua o loop com um pequeno atraso
    loopId = setTimeout(() => {
        gameLoop()
    }, 300)
}

// Inicia o jogo
gameLoop()

// Define as direções com base nas teclas pressionadas
document.addEventListener("keydown", ({ key }) => {
    if (key == "ArrowRight" && direction != "left") {
        direction = "right"
    }

    if (key == "ArrowLeft" && direction != "right") {
        direction = "left"
    }

    if (key == "ArrowDown" && direction != "up") {
        direction = "down"
    }

    if (key == "ArrowUp" && direction != "down") {
        direction = "up"
    }
})

// Reinicia o jogo ao clicar no botão de jogar
buttonPlay.addEventListener("click", () => {
    score.innerText = "00" // Reseta a pontuação
    menu.style.display = "none" // Esconde o menu
    canvas.style.filter = "none" // Remove o efeito de blur

    snake = [initialPosition] // Reseta a cobra para a posição inicial
})
