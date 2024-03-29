import { Component, OnInit } from '@angular/core';
import { TournamentService } from 'src/app/Services/tournament.service';
import { TournamentRegistrationService } from 'src/app/Services/tournament-registration.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ITournament, ITeamType } from '../../../../../interfaces/tournament';
import { ITournamentRegistrations } from '../../../../../interfaces/tournament-registrations';
import { IUser } from '../../../../../interfaces/user';
import { UserService } from 'src/app/Services/user.service';
import { RED, GREEN } from '../../../../../settings/variables';
import { ITeam } from '../../../../../interfaces/team';
import { TeamService } from 'src/app/Services/team.service';
import { teamType, teamNumber } from '../../../../../settings/tournament_config';

@Component({
  selector: 'app-show-tournament',
  templateUrl: './show-tournament.component.html',
  styleUrls: ['./show-tournament.component.css']
})
export class ShowTournamentComponent implements OnInit {
  private tournamentID: number;
  public tournament: ITournament;
  private tournamentRegistrations: ITournamentRegistrations[];

  public showMsg: boolean;
  public msg: string;
  public msgColor: string;

  constructor(
    private teamService: TeamService,
    private tournamentService: TournamentService,
    private tournamentRegService: TournamentRegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
  ) {
    this.tournamentID = Number(this.route.snapshot.queryParams.id);
    this.tournament = null;
    this.tournamentRegistrations = [];

    this.showMsg = false;
    this.msg = '';
    this.msgColor = '';
  }

  ngOnInit() {
    if (isNaN((this.tournamentID))) {
      this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      return;
    }

    this.tournamentService.getTournament(this.tournamentID)
    .then((tournament: ITournament) => {
      this.tournament = tournament;
    })
    .catch(() => {
      this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
    });

    this.tournamentRegService.getRegisterations(this.tournamentID)
    .then((tr: ITournamentRegistrations[]) => {
      this.tournamentRegistrations = tr;
    })
    .catch(() => {
      this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
    });
  }

  public getTeamLogo(fileName: string): string {
    return this.teamService.getTeamLogo(fileName);
  }

  public getLoggedUser(): IUser {
    return this.userService.getLoggedData;
  }

  public canJoinAsReferee(userID: number): boolean {
    if (this.tournament.created !== null) {
      return false;
    }

    if (this.tournament.referee_id !== null) {
      return false;
    }

    const index: number = this.tournamentRegistrations.findIndex(
      (tr: ITournamentRegistrations) => tr.user_id === userID);

    if (index < 0) {
      return true;
    }

    return false;
  }

  public canJoinAsTeam(teamID: number): boolean {
    if (this.tournament.created !== null) {
      return false;
    }

    if (this.tournament.team_type === ITeamType.PvP) {
      return false;
    }

    if (teamID === null || teamID === undefined) {
      return false;
    }

    const users: IUser[] = this.userService.getUsers;
    const count: number = users.filter((usr: IUser) => usr.team !== null && usr.team === teamID).length;

    if (count < teamNumber[this.tournament.team_type]) {
      return false;
    }

    const index: number = this.tournamentRegistrations.findIndex((tr: ITournamentRegistrations) => tr.team_id === teamID);

    if (index < 0) {
      return true;
    }

    return false;
  }

  public canJoinAsUser(userID: number): boolean {
    if (this.tournament.created !== null) {
      return false;
    }

    // Check if given tournament is for users
    if (this.tournament.team_type !== ITeamType.PvP) {
      return false;
    }

    if (this.tournament.referee_id === userID) {
      return false;
    }

    const index: number = this.tournamentRegistrations.findIndex((tr: ITournamentRegistrations) => tr.user_id === userID);

    if (index < 0) {
      return true;
    }

    return false;
  }

  public joinAsReferee(userID: number): void {
    this.showMsg = false;

    this.tournamentRegService.registerAsReferee(this.tournamentID, userID)
    .then(() => {
      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((trs: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = trs;
      })
      .catch(() => {
        this.tournamentRegistrations = [];
      });
      this.msg = 'You have been successfully registered. Now wait for creator to accept you.';
      this.msgColor = GREEN;
      this.showMsg = true;
    })
    .catch(() => {
      this.msg = 'There was a problem with registering. Please try again.';
      this.msgColor = RED;
      this.showMsg = true;
    });
  }

  public joinAsTeam(teamID: number): void {
    this.showMsg = false;

    this.tournamentRegService.registerAsTeam(this.tournamentID, teamID)
    .then(() => {
      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((trs: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = trs;
      })
      .catch(() => {
        this.tournamentRegistrations = [];
      });
      this.msg = 'You have been successfully registered. Now wait for creator to accept you.';
      this.msgColor = GREEN;
      this.showMsg = true;
    })
    .catch(() => {
      this.msg = 'There was a problem with registering. Please try again.';
      this.msgColor = RED;
      this.showMsg = true;
    });
  }

  public joinAsUser(userID: number): void {
    this.showMsg = false;

    this.tournamentRegService.registerAsUser(this.tournamentID, userID)
    .then(() => {
      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((trs: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = trs;
      })
      .catch(() => {
        this.tournamentRegistrations = [];
      });
      this.msg = 'You have been successfully registered. Now wait for creator to accept you.';
      this.msgColor = GREEN;
      this.showMsg = true;
    })
    .catch(() => {
      this.msg = 'There was a problem with registering. Please try again.';
      this.msgColor = RED;
      this.showMsg = true;
    });
  }

  public get getAvalaibleReferees(): ITournamentRegistrations[] {
    const tournamentRegistrations: ITournamentRegistrations[] = [];
    const users: IUser[] = this.userService.getUsers;

    for (const tr of this.tournamentRegistrations) {
      if (tr.referee === true && tr.allowed === null) {
        const index: number = users.findIndex((usr: IUser) => usr.id === tr.user_id);

        if (index < 0) {
          continue;
        }

        tr.name = users[index].name;
        tr.file_name = '';

        tournamentRegistrations.push(tr);
      }
    }

    return tournamentRegistrations;
  }

  public get getDeniedReferees(): ITournamentRegistrations[] {
    const tournamentRegistrations: ITournamentRegistrations[] = [];
    const users: IUser[] = this.userService.getUsers;

    for (const tr of this.tournamentRegistrations) {
      if (tr.referee === true && tr.allowed === false) {
        const index: number = users.findIndex((usr: IUser) => usr.id === tr.user_id);

        if (index < 0) {
          continue;
        }

        tr.name = users[index].name;
        tr.file_name = '';

        tournamentRegistrations.push(tr);
      }
    }

    return tournamentRegistrations;
  }

  public get getAcceptedTeams(): ITournamentRegistrations[] {
    const tournamentRegistrations: ITournamentRegistrations[] = [];
    const teams: ITeam[] = this.teamService.getTeams;

    if (this.tournament.team_type === ITeamType.PvP) {
      return tournamentRegistrations;
    }

    for (const tr of this.tournamentRegistrations) {
      if (tr.referee === false && tr.allowed === true && tr.team_id !== null) {
        const index: number = teams.findIndex((t: ITeam) => t.id === tr.team_id);

        if (index < 0) {
          continue;
        }

        tr.name = teams[index].name;
        tr.file_name = teams[index].file_name;

        tournamentRegistrations.push(tr);
      }
    }

    return tournamentRegistrations;
  }

  public get getAvalaibleTeams(): ITournamentRegistrations[] {
    const tournamentRegistrations: ITournamentRegistrations[] = [];
    const teams: ITeam[] = this.teamService.getTeams;

    if (this.tournament.team_type === ITeamType.PvP) {
      return tournamentRegistrations;
    }

    for (const tr of this.tournamentRegistrations) {
      if (tr.referee === false && tr.allowed === null && tr.team_id !== null) {
        const index: number = teams.findIndex((team: ITeam) => team.id === tr.team_id);

        if (index < 0) {
          continue;
        }

        tr.name = teams[index].name;
        tr.file_name = teams[index].file_name;

        tournamentRegistrations.push(tr);
      }
    }

    return tournamentRegistrations;
  }

  public get getDeniedTeams(): ITournamentRegistrations[] {
    const tournamentRegistrations: ITournamentRegistrations[] = [];
    const teams: ITeam[] = this.teamService.getTeams;

    if (this.tournament.team_type === ITeamType.PvP) {
      return tournamentRegistrations;
    }

    for (const tr of this.tournamentRegistrations) {
      if (tr.referee === false && tr.allowed === false && tr.team_id !== null) {
        const index: number = teams.findIndex((team: ITeam) => team.id === tr.team_id);

        if (index < 0) {
          continue;
        }

        tr.name = teams[index].name;
        tr.file_name = teams[index].file_name;

        tournamentRegistrations.push(tr);
      }
    }

    return tournamentRegistrations;
  }

  public get getAcceptedUsers(): ITournamentRegistrations[] {
    const tournamentRegistrations: ITournamentRegistrations[] = [];
    const users: IUser[] = this.userService.getUsers;

    if (this.tournament.team_type !== ITeamType.PvP) {
      return tournamentRegistrations;
    }


    for (const tr of this.tournamentRegistrations) {
      if (tr.referee === false && tr.allowed === true && tr.user_id !== null) {
        const index: number = users.findIndex((usr: IUser) => usr.id === tr.user_id);

        if (index < 0) {
          continue;
        }

        tr.name = users[index].name;
        tr.file_name = '';

        tournamentRegistrations.push(tr);
      }
    }

    return tournamentRegistrations;
  }

  public get getAvalaibleUsers(): ITournamentRegistrations[] {
    const tournamentRegistrations: ITournamentRegistrations[] = [];
    const users: IUser[] = this.userService.getUsers;

    if (this.tournament.team_type !== ITeamType.PvP) {
      return tournamentRegistrations;
    }


    for (const tr of this.tournamentRegistrations) {
      if (tr.referee === false && tr.allowed === null && tr.user_id !== null) {
        const index: number = users.findIndex((usr: IUser) => usr.id === tr.user_id);

        if (index < 0) {
          continue;
        }

        tr.name = users[index].name;
        tr.file_name = '';

        tournamentRegistrations.push(tr);
      }
    }

    return tournamentRegistrations;
  }

  public get getDeniedUsers(): ITournamentRegistrations[] {
    const tournamentRegistrations: ITournamentRegistrations[] = [];
    const users: IUser[] = this.userService.getUsers;

    if (this.tournament.team_type !== ITeamType.PvP) {
      return tournamentRegistrations;
    }

    for (const tr of this.tournamentRegistrations) {
      if (tr.referee === false && tr.allowed === false && tr.user_id !== null) {
        const index: number = users.findIndex((usr: IUser) => usr.id === tr.user_id);

        if (index < 0) {
          continue;
        }

        tr.name = users[index].name;
        tr.file_name = '';

        tournamentRegistrations.push(tr);
      }
    }

    return tournamentRegistrations;
  }

  public get getRegUsers(): number {
    return this.tournamentRegistrations.filter(
      (tr: ITournamentRegistrations) => tr.allowed === true && tr.user_id !== null && tr.referee === false).length;
  }

  public get getRegTeams(): number {
    return this.tournamentRegistrations.filter(
      (tr: ITournamentRegistrations) => tr.allowed === true && tr.team_id !== null).length;
  }

  public getCurrReferee(): IUser {
    if (this.tournament === null || this.tournament.referee_id === null) {
      return null;
    }

    const users: IUser[] = this.userService.getUsers;
    const index: number = users.findIndex((usr: IUser) => usr.id === this.tournament.referee_id);

    if (index < 0) {
      return null;
    }

    return users[index];
  }

  public clearReferee(): void {
    this.tournamentRegService.clearReferee(this.tournamentID)
    .then(() => {
      this.tournamentService.getTournament(this.tournamentID)
      .then((tournament: ITournament) => {
        this.tournament = tournament;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((tr: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = tr;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.showMsg = true;
      this.msg = 'Referee cleared.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public acceptReferee(userID: number): void {
    this.tournamentRegService.acceptReferee(this.tournamentID, userID)
    .then(() => {

      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((tr: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = tr;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.tournamentService.getTournament(this.tournamentID)
      .then((tournament: ITournament) => {
        this.tournament = tournament;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.showMsg = true;
      this.msg = 'Referee added.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public denyReferee(userID: number): void {
    this.tournamentRegService.denyReferee(this.tournamentID, userID)
    .then(() => {

      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((tr: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = tr;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.showMsg = true;
      this.msg = 'Referee denied.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public acceptUser(userID: number): void {
    this.tournamentRegService.acceptUser(this.tournamentID, userID)
    .then(() => {

      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((tr: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = tr;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.showMsg = true;
      this.msg = 'User added.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public denyUser(userID: number): void {
    this.tournamentRegService.denyUser(this.tournamentID, userID)
    .then(() => {

      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((tr: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = tr;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.showMsg = true;
      this.msg = 'User has been denied.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was an error. Please try again.';
      this.msgColor = RED;
    });
  }

  public acceptTeam(teamID: number): void {
    this.tournamentRegService.acceptTeam(this.tournamentID, teamID)
    .then(() => {

      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((tr: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = tr;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.showMsg = true;
      this.msg = 'Team added.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public denyTeam(teamID: number): void {
    this.tournamentRegService.denyTeam(this.tournamentID, teamID)
    .then(() => {

      this.tournamentRegService.getRegisterations(this.tournamentID)
      .then((tr: ITournamentRegistrations[]) => {
        this.tournamentRegistrations = tr;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });

      this.showMsg = true;
      this.msg = 'Team denied.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public get canFinalize(): boolean {
    if (this.tournament === null) {
      return false;
    }

    if (this.tournament.referee_id === null) {
      return false;
    }

    if (this.tournament.team_type === ITeamType.PvP && this.tournament.number_of_players !== this.getAcceptedUsers.length) {
      return false;
    }

    if (this.tournament.team_type !== ITeamType.PvP && this.tournament.number_of_players !== this.getAcceptedTeams.length) {
      return false;
    }

    return true;
  }

  public finalizeTournament(): void {
    if (this.canFinalize === false) {
      this.showMsg = true;
      this.msg = 'Can´t finalize. Referee is missing or the number of players is not filled.';
      this.msgColor = RED;
      return;
    }
    this.tournamentService.finalizeTournament(this.tournamentID)
    .then(() => {
      this.tournamentService.getTournament(this.tournamentID)
      .then((tournament: ITournament) => {
        this.tournament = tournament;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });
      this.showMsg = true;
      this.msg = 'You have finalized selection, now you can select teams to play against.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public startTournament(): void {
    this.tournamentService.startTournament(this.tournamentID)
    .then(() => {
      this.tournamentService.getTournament(this.tournamentID)
      .then((tournament: ITournament) => {
        this.tournament = tournament;
      })
      .catch(() => {
        this.router.navigate([''], { queryParams: { succ: false, msg: 'Given tournament does not exist', listing: 'tournament'}});
      });
      this.showMsg = true;
      this.msg = 'You have started tournament, now only referee can add statistics.';
      this.msgColor = GREEN;
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public deleteTournament(): void {
    this.tournamentService.deleteTournament(this.tournamentID)
    .then(() => {
      this.router.navigate([''], { queryParams: { succ: true, msg: 'Tournament has been deleted.', listing: 'tournament'}});
    })
    .catch(() => {
      this.showMsg = true;
      this.msg = 'There was and error. Please try again.';
      this.msgColor = RED;
    });
  }

  public getTeamType(index: number): string {
    if (index < 0 || index >= teamType.length) {
      return '';
    }

    return teamType[index];
  }

  public showUser(userID): void {
    this.router.navigate(['show-user'], { queryParams: { id: userID}});
  }

  public showTeam(teamID: number): void {
    this.router.navigate(['show-team', teamID]);
  }

  public closeMessage(): void {
    this.showMsg = false;
  }
}
