class Chalk {
  public style: string = 'padding: 2px 6px; border-radius: 2px; color: #fff; background: #1e80ff; font-weight: bold;'

  // #region
  blue(...args: any[]) {
    console.log(
      `%c${args.join(' ')}`,
      this.style
    )
    return this
  }

  //#region x
}

export default new Chalk()