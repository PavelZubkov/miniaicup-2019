import json

SCRIPT = [
    'down', 'left', 'up', 'left',
    'left',
    'left',
    'left',
    'left',
    'left',
    'left',
    'left',
    'left',
    'left',
    'left',
    'left',
]


def main(commands):
    i = 0
    while True:
        z = input()
        parsed = json.loads(z)
        if parsed["type"] == 'start_game':
            i = 0
        else:
            print(json.dumps({"command": commands[i], 'debug': str(z)}))
            i += 1
        if i >= len(SCRIPT):
            i = 0


main(SCRIPT)
