#!/usr/bin/env python3

import json
import csv
from math import floor

ystart = 1970
filename = 'playerdata70_new'

minPA = 50
minIP = 20


def prep():

    # basic filter
    with open(filename+'.csv', 'r', newline='') as f:
        data = [row for row in csv.DictReader(f) if int(row['Year']) >= ystart and
                int(row['Salary']) > 0 and
                row['ERA'] != 'inf']

    # convert format
    for row in data:
        # int values
        for k in ["Year", "Age",
                "Salary",
                "G", "PA", "HR", "RBI", "SB", "BB", "SO",
                "G", "GS"
                ]:
            if row[k] != '':
                row[k] = int(row[k])
        for k in ["WAR",
                "AVG", "OBP", "SLG", "OPS",
                "OPS+", "ERA", "FIP", "WHIP",
                "ERA+", "H9",
                "HR9", "BB9", "SO9"
            ]:
            if row[k] != '':
                row[k] = float(row[k])
                # IP need to be handled separately
        if row['IP'] != '':
            ip = row['IP'].split('.')
            row['IP'] = round(int(ip[0]) + int(ip[1])/3, 2)

    with open(filename+'.json', 'w') as f:
        f.write(json.dumps(data))

def computeAdditionalData():

    with open(filename+'.json', 'r') as fr:
        raw = json.loads(fr.read())


    for row in raw:
        row['SOPA'] = ''
        row['BBPA'] = ''
        row['SBPA'] = ''
        row['HRPA'] = ''
        if row['Position'] == 'P':
            row['Pos2'] = 'SP' if (row['GS'] > 0 ) else 'RP'
        else:
            row['Pos2'] = 'F'
            row['SOPA'] = round(row['SO'] / row['PA'] if (row['PA'] > 0) else -1, 3)
            row['BBPA'] = round(row['BB'] / row['PA'] if (row['PA'] > 0) else -1, 3)
            row['SBPA'] = round(row['SB'] / row['PA'] if (row['PA'] > 0) else -1, 3)
            row['HRPA'] = round(row['HR'] / row['PA'] if (row['PA'] > 0) else -1, 3)

    with open(filename+'.json', 'w') as fw:
        fw.write(json.dumps(raw))

# def filterTeam(team):

#     with open(filename+'.json', 'r') as fr:
#         raw = json.loads(fr.read())

#     with open('%s_%s.json'%(filename, team), 'w') as fw:
#         fw.write(json.dumps([row for row in raw if row['Team'] == team]))

def computeAverageSalary():

    with open(filename+'.json', 'r') as fr:
        raw = json.loads(fr.read())

    raw_nested = nest(raw, 'Year');

    salaries = {}
    for y in range(ystart, 2017+1, 1):
        sum_all, sum_750, n_all, n_750 = 0, 0, 0, 0

        players = raw_nested[y]
        players.sort(key = lambda x: -x['Salary'])
        # top 750 players
        for pl in players[0:750]:
            sum_all += pl['Salary']
            sum_750 += pl['Salary']
            n_all += 1
            n_750 += 1
        # others
        for pl in players[750:]:
            sum_all += pl['Salary']
            n_all += 1

        salaries[y] = {
            'sum_all': sum_all,
            'sum_750': sum_750,
            'n_all': n_all,
            'n_750': n_750,
            'avg_all': sum_all // n_all,
            'avg_750': sum_750 // n_750,
        }

    with open('salaries.json', 'w') as fw:
        fw.write(json.dumps(salaries))

    for row in raw:
        row['Salary_norm'] = round(row['Salary'] /
                salaries[row['Year']]['avg_750'], 3)

    with open(filename+'.json', 'w') as fw:
        fw.write(json.dumps(raw))


def computeStatPercentiles():

    Flist = ['AVG', 'HRPA', 'BBPA', 'SOPA', 'SBPA']
    Plist = ['ERA', 'FIP', 'SO9', 'H9', 'BB9']

    with open(filename+'.json', 'r') as fr:
        raw = json.loads(fr.read())

    perc = {
        'F': {
            year: {
                stat: []
                for stat in Flist
            }
            for year in range(ystart, 2017+1)
        },
        'SP': {
            year: {
                stat: []
                for stat in Plist
            }
            for year in range(ystart, 2017+1)
        },
        'RP': {
            year: {
                stat: []
                for stat in Plist
            }
            for year in range(ystart, 2017+1)
        },
    }

    for row in raw:

        year = row['Year']

        # fielders
        if row['Position'] == 'F' and row['PA'] > minPA:
            for stat in Flist:
                perc['F'][year][stat].append(row[stat])
        # pitchers
        elif row['Position'] == 'P' and row['IP'] > minIP:
            for stat in Plist:
                perc[row['Pos2']][year][stat].append(row[stat])

    # sort all stat lists
    asc = ['AVG', 'HRPA', 'SBPA', 'BBPA', 'SO9']
    dsc = ['SOPA', 'ERA', 'BB9', 'H9', 'FIP']
    for v in perc.values():
        for vy in v.values():
            for (stat, arr) in vy.items():
                arr.sort()
                if stat in dsc:
                    arr.reverse()

    # intermediary output
    with open('percentiles.json', 'w') as fw:
        fw.write(json.dumps(perc))


    # now computing plauer percetiles
    for row in raw:
        yr = row['Year']
        for stat in Plist + Flist:
            row[stat+'_perc'] = ''
        # fielders
        if row['Pos2'] == 'F' and row['PA'] > minPA:
            for stat in Flist:
                pcs = perc['F'][yr][stat]
                row[stat+'_perc'] = floor(
                        pcs.index(row[stat]) * 100 / len(pcs))
        # pitchers
        elif row['Position'] == 'P' and row['IP'] > minIP:
            for stat in Plist:
                pcs = perc[row['Pos2']][yr][stat]
                row[stat+'_perc'] = floor(
                        pcs.index(row[stat]) * 100 / len(pcs))

    with open(filename+'.json', 'w') as fw:
        fw.write(json.dumps(raw))






def nest(dictList, key):
    # nest utility
    # nest a dict into {key1:[value1-1,value1-2,...], key2:[], ...}

    # order is preserved

    nested = {}
    for d in dictList:
        k = d[key]
        if k not in nested:
            nested[k] = [d,]
        else:
            nested[k].append(d)
    return nested

def nestData():
    # nest by team then year

    with open(filename+'.json', 'r') as fr:
        raw = json.loads(fr.read())

    # nest by team
    nested = nest(raw, 'Team')
    # nest by year
    for (k, v) in nested.items():
        nested[k] = nest(v, 'Year')
        # fill the empty years
        for y in range(ystart, 2017+1, 1):
            if y not in nested[k]:
                nested[k][y] = []

    with open(filename + '_nested.json', 'w') as fw:
        fw.write(json.dumps(nested))


    # nest by player
    nested = nest(raw, 'key_bbref')
    # nest by year
    for (k, v) in nested.items():
        nested[k] = nest(v, 'Year')
        # # fill the empty years
        # for y in range(ystart, 2017+1, 1):
        #     if y not in nested[k]:
        #         nested[k][y] = []

        ## deal with multiple lines in a year
        for (year, rows) in nested[k].items():
            if len(rows) > 1:
                # print(nested[k][year])
                nested[k][year] = [rows[0],] # use the TOT row
                # print(nested[k][year][0]['Team'])
                # print(nested[k][year][0]['Pos2'])



    with open(filename + '_nested_by_player.json', 'w') as fw:
        fw.write(json.dumps(nested))


def getTeamData():
    with open('Teams.csv', 'r') as fr:
        data = [row for row in csv.DictReader(fr) if
                int(row['yearID']) >= ystart]

    # trim
    for (i,row) in enumerate(data):
        new_row = {
            'yearID': int(row['yearID']),
            'teamIDBR': row['teamIDBR'],
            'DivWin': int(row['DivWin'] == 'Y'),
            'WCWin': int(row['WCWin'] == 'Y'),
            'LgWin': int(row['LgWin'] == 'Y'),
            'WSWin': int(row['WSWin'] == 'Y'),
            'W': int(row['W']),
            'L': int(row['L']),
            'wpct': round(int(row['W']) / (int(row['W']) + int(row['L'])), 3),
        }
        data[i] = new_row

    # data = nest(data, 'franchID')
    data = nest(data, 'teamIDBR') # use the baseball-reference id in the csv!

    with open('Teams_nested.json', 'w') as fw:
        fw.write(json.dumps(data))

    # further nest by year
    for (k, v) in data.items():
        data[k] = nest(v, 'yearID')

    with open('Teams_nested_year.json', 'w') as fw:
        fw.write(json.dumps(data))

def getTeamStatsRange():
    with open(filename+'.json', 'r') as fr:
        raw = json.loads(fr.read())

    range = {} # storing the result {team: {stat: {max: max, min: min}}}

    raw = nest(raw, 'Team')

    # note these are different from the ones used above
    Flist = ['AVG', 'HR', 'BB', 'SO', 'SB']
    Plist = ['ERA', 'FIP', 'SO9', 'H9', 'BB9']

    for (team, v) in raw.items():
        teamrange = {}
        for stat in Flist + Plist:
            teamrange[stat] = {
                'max': -10000,
                'min': 10000,
            }
        for row in v:
            if row['Position'] == 'F' and row['PA'] > minPA:
                for stat in Flist:
                    teamrange[stat]['max'] = max(teamrange[stat]['max'], row[stat])
                    teamrange[stat]['min'] = min(teamrange[stat]['min'], row[stat])
            elif row['Position'] == 'P' and row['IP'] > minIP:
                for stat in Plist:
                    teamrange[stat]['max'] = max(teamrange[stat]['max'], row[stat])
                    teamrange[stat]['min'] = min(teamrange[stat]['min'], row[stat])
        range[team] = teamrange

    with open('team_stats_range.json', 'w') as fw:
        fw.write(json.dumps(range))

def getTeamNameDict():
    with open('Teams.csv', 'r') as fr:
        data = [row for row in csv.DictReader(fr) if
                int(row['yearID']) >= ystart]

    nameDict = {}

    for row in data:
        nameDict[row['teamIDBR']] = {
            'name': row['name'],
            'teamIDESPN': row['teamIDBR'],
        }
    alter = {'SDP':'SD', 'SFG':'SF', 'KCR':'KC', 'TBR': 'TB', 'TBD':'TB', 'WSN':'WSH', 'ANA':'LAA', 'CAL':'LAA', 'FLA':'MIA',}
    for (k ,v) in alter.items():
        nameDict[k]['teamIDESPN'] = v


    with open('team_name_dict.json', 'w') as fw:
        fw.write(json.dumps(nameDict))

def writeBackToCSV():
    with open(filename+'.json', 'r') as fr:
        raw = json.loads(fr.read())

    keys = raw[0].keys()
    print(keys)
    with open('playerdata_final.csv', 'w') as fw:
        dict_writer = csv.DictWriter(fw, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(raw)



if __name__ == '__main__':

    # prep()
    # computeAdditionalData()
    # computeAverageSalary()
    # computeStatPercentiles()
    # nestData()

    # getTeamData()

    # getTeamStatsRange()
    # getTeamNameDict()

    writeBackToCSV()


    # filterTeam('LAD')
