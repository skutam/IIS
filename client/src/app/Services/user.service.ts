import { Injectable } from '@angular/core';
import { IUser } from '../../../../interfaces/user';
import { userKeyValue, timeout } from '../../../../settings/variables';
import { registerPage, loginPage, getUsersPage, teamUserPage } from '../../../../settings/routes';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: IUser[];
  private filteredUsers: IUser[];
  private currFilter: string;

  constructor() {
    this.users = [];
    this.filteredUsers = [];
    this.currFilter = '';

    this.loadUsers();

    setInterval(() => {
      this.loadUsers();
    }, timeout);
  }

  public get getLoggedData(): IUser {
    const value: string = localStorage.getItem(userKeyValue);

    if (value == null) {
      return null;
    }

    return JSON.parse(value) as IUser;
  }

  public isLoggedIn(): boolean {
    return this.getLoggedData !== null;
  }

  public get getUsers(): IUser[] {
    return this.filteredUsers;
  }

  public getTeamUsers(teamID: number): Promise<IUser[]> {
    return new Promise((resolve, reject) => {
      const http = new XMLHttpRequest();
      const page = `${teamUserPage}/${teamID}`;
      http.open('GET', page, true);

      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          try {
            const res: IUser[] = JSON.parse(http.responseText);
            return resolve(res);
          } catch (error) {
            return reject();
          }
        } else if (http.readyState === 4 && http.status !== 200) {
          return reject();
        }
      };

      http.send(null);
    });
  }

  private loadUsers(): void {
    const http = new XMLHttpRequest();
    http.open('GET', getUsersPage, true);

    http.onreadystatechange = () => {
      if (http.readyState === 4 && http.status === 200) {
        try {
          this.users = JSON.parse(http.responseText);
          this.filterUsers(this.currFilter);
          this.updateMe();
        } catch (error) {
          this.users = [];
        }
      } else if (http.readyState === 4 && http.status !== 200) {
        this.users = [];
      }
    };

    http.send(null);
  }

  private updateMe(): void {
    const user: IUser = this.getLoggedData;

    if (user === null) {
      return;
    }

    const index: number = this.users.findIndex((usr: IUser) => usr.id === user.id);

    // Our account has been deleted logout user
    if (index < 0) {
      this.logout();
      return;
    }

    this.saveLoggedData(this.users[index]);
  }

  public filterUsers(filter: string): void {
    const filt: string = filter.toUpperCase();
    this.currFilter = filter;
    this.filteredUsers = [];

    for (const usr of this.users) {
      const a: string = usr.name.toUpperCase();
      if (a.includes(filt)) {
        this.filteredUsers.push(usr);
      }
    }
  }

  public saveLoggedData(user: IUser): void {
    localStorage.setItem(userKeyValue, JSON.stringify(user));
  }

  public login(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.getLoggedData != null) {
        return resolve();
      }

      const data = {
        user: username,
        pass: password
      };

      const http = new XMLHttpRequest();
      http.open('POST', loginPage, true);
      http.setRequestHeader('Content-Type', 'application/json');
      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          const user: IUser = JSON.parse(http.responseText);
          this.saveLoggedData(user);
          return resolve();

        } else if (http.readyState === 4 && http.status !== 200) {
          return reject();
        }
      };

      http.send(JSON.stringify(data));
    });
  }

  public register(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = {
        user: username,
        pass: password,
        admin: false,
      };

      const http = new XMLHttpRequest();
      http.open('POST', registerPage, true);
      http.setRequestHeader('Content-Type', 'application/json');
      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          this.loadUsers();
          return resolve();
        } else if (http.readyState === 4 && http.status !== 200) {
          return reject();
        }
      };

      http.send(JSON.stringify(data));
    });
  }

  public logout(): void {
    localStorage.removeItem(userKeyValue);
  }

  public addAuthentication(http: XMLHttpRequest): void {
    const user: IUser = this.getLoggedData;

    if (user !== null) {
      http.setRequestHeader('Authorization', user.name);
    }
  }

  public updateUser(user: IUser, password: string): Promise<IUser> {
    return new Promise((resolve, reject) => {
      const page = `${getUsersPage}/${user.id}`;
      const data = {
        user: user.name,
        pass: password,
        admin: user.admin,
        team: user.team,
        description: user.description,
      };

      const http = new XMLHttpRequest();
      http.open('PUT', page, true);
      http.setRequestHeader('Content-Type', 'application/json');

      this.addAuthentication(http);

      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          try {
            const usr: IUser = JSON.parse(http.responseText);
            this.saveLoggedData(usr);
            return resolve();
          } catch (error) {
            return resolve();
          }
        } else if (http.readyState === 4 && http.status !== 200) {
          return reject();
        }
      };

      http.send(JSON.stringify(data));
    });
  }

  public getUser(id: number): Promise<IUser> {
    return new Promise((resolve, reject) => {
      const page = `${getUsersPage}/${id}`;
      const http = new XMLHttpRequest();
      http.open('GET', page, true);

      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          try {
            const usr: IUser = JSON.parse(http.responseText);
            return resolve(usr);
          } catch (error) {
            return reject();
          }
        } else if (http.readyState === 4 && http.status !== 200) {
          return reject();
        }
      };

      http.send(null);
    });
  }
}