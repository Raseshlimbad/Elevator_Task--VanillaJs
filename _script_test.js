//Todo
//queue elevator calls
//on click waiting text until elevator reach the position
//Elevator color change while transition
//whne elevator reaches to destination change it to green
//2 sec wait in call displaying arrived
//elevator smooth transition to selected floor
//measure and dispaly the elevator reach time to destination

const calls = document.querySelectorAll(".btn");
const elevators = document.querySelectorAll(".elevator");

let queueFloors = [];

let allElevatorStatus = [
    {
        elevatorIndex: 0,
        floor: 0,
        moving: false,
    },
    {
        elevatorIndex: 1,
        floor: 0,
        moving: false,
    },
    {
        elevatorIndex: 2,
        floor: 0,
        moving: false,
    },
    {
        elevatorIndex: 3,
        floor: 0,
        moving: false,
    },
    {
        elevatorIndex: 4,
        floor: 0,
        moving: false,
    },
];

function findMinDistanceFromElevatorToDestination(currentFloor, allElevatorStatus) {
    let minDistance = Infinity;
    let minDistanceIndex = -1; // Start with -1 instead of Infinity

    for (let i = 0; i < allElevatorStatus.length; i++) {
        let diff = Math.abs(currentFloor - allElevatorStatus[i].floor);

        if (diff < minDistance && !allElevatorStatus[i].moving) {
            minDistance = diff;
            minDistanceIndex = i;
        }
    }

    return [minDistance, minDistanceIndex >= 0 ? minDistanceIndex : Infinity]; // Avoid returning Infinity if no lift found
}


function isElevatorAlreayThere(allElevatorStatus, calledFloor) {
    setTimeout(() => {
        document.querySelector('.alreadyThere').textContent = ''
    }, 2000);
    return allElevatorStatus.some((elevator) => elevator.floor === calledFloor);
}

function allElevatorsMoving(allElevatorStatus) {
    return allElevatorStatus.every((elevator) => elevator.moving === true);
}

const playSound = () => {
    const audio = new Audio("./Elevator-ding.mp3");
    audio.play();
};


calls.forEach((call) => {

    call.addEventListener("click", () => {
        const clickedFloor = parseInt(call.id.split("-")[1]);

        if (allElevatorsMoving(allElevatorStatus)) {
            queueFloors.push(clickedFloor);
        }

        if (!isElevatorAlreayThere(allElevatorStatus, clickedFloor)) {

            call.style.backgroundColor = "red";
            call.textContent = "Waiting";
            call.disabled = true;

            elevatorStatus(clickedFloor, call);
        } else {
            document.querySelector('.alreadyThere').textContent = 'Elevator is already there';
        }
    });
});

function elevatorStatus(clickedFloor, call) {
    let [nearestElevatorDistance, nearestElevatorIndex] = findMinDistanceFromElevatorToDestination(clickedFloor, allElevatorStatus);

    // ✅ If no available elevator, queue the request
    if (nearestElevatorIndex === Infinity) {
        queueFloors.push(clickedFloor);
        console.log(`No available elevator, floor ${clickedFloor} added to queue.`);
        return;  // Stop execution until a lift becomes available
    }

    // ✅ Display estimated arrival time for **all floors**
    const rowElement = document.getElementById(`row-${clickedFloor}`);
    if (rowElement) {
        const destinationBox = rowElement.querySelector(`.box:nth-child(${nearestElevatorIndex + 2})`);
        if (destinationBox) {
            destinationBox.textContent = `${nearestElevatorDistance * 0.5} Sec`;
        }
    }

    MoveElevator(clickedFloor, nearestElevatorIndex, call);
}



function MoveElevator(clickedFloor, pos, call) {
    const elevator = elevators[pos];
    const currentFloor = allElevatorStatus[pos].floor

    //update elevator status
    allElevatorStatus[pos].floor = clickedFloor;
    allElevatorStatus[pos].moving = true;

    //change elevator color
    elevator.querySelectorAll("path").forEach((path) => {
        path.setAttribute("fill", "red");
    });

    //   0.5 sec is speed per floor
    let speedPerFloor = 0.5;
    const floorElement = document.querySelector(".box");
    const floorHeight = floorElement.offsetHeight;
    // console.log(floorHeight)

    let duration = Math.abs(clickedFloor - currentFloor) * speedPerFloor;

    elevator.style.transition = `transform ${duration}s linear`;
    // elevator.style.transform = `translateY(-${clickedFloor * 175}%)`;
    elevator.style.transform = `translateY(-${clickedFloor * floorHeight}px)`;


    setTimeout(() => {

        //Remove estimated time of arrival
        if (clickedFloor !== 0) {
            const rowElement = document.getElementById(`row-${clickedFloor}`);
            const destinationBox = rowElement.querySelector(
                `.box:nth-child(${pos + 2})`
            );
            if (destinationBox) {
                destinationBox.textContent = ``;
            }
        }

        //Play elevator sound
        playSound();

        //Change Elevator Color to green
        elevator.querySelectorAll("path").forEach((path) => {
            path.setAttribute("fill", "green");
        });

        //Change call text and color
        call.style.backgroundColor = "white";
        call.textContent = "Arrived";
        call.style.border = "1px solid green"

    }, duration * 1000);

    
    setTimeout(() => {

        //Change elevator state
        allElevatorStatus[pos].moving = false;

        //Change call text
        call.style.backgroundColor = "rgb(101, 237, 101)";
        call.textContent = "Call";
        call.style.border = "none"

        //Change elevator color
        elevator.querySelectorAll("path").forEach((path) => {
            path.setAttribute("fill", "black");
        });

        //Move elevator to pending queue
        if (queueFloors.length) {
            const nextFloor = queueFloors.shift();
            const nextCall = document.getElementById(`btn-${nextFloor}`);
            elevatorStatus(nextFloor, nextCall);
        }
    }, duration * 1000 + 2000);
}

