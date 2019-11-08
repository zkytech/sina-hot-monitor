
const { override, fixBabelImports,addLessLoader } = require('customize-cra');
const path = require('path');
const setGlobalObject = value => config => {

    // if(config.mode==="production"){
    //     config.output.publicPath = '/taishi/'
    // }
    // console.log(config)

    return config
}

const addWebpackExternals = (externalDeps) => config => {
    config.externals = {
        ...config.externals,
        ...externalDeps
    };
    return config;
};

module.exports = {
    webpack:override(
        // antd模块化加载
        fixBabelImports('import', {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: true,
        }),
        // antd主题配置
        addLessLoader({
            javascriptEnabled: true,
            // modifyVars: { '@primary-color': '#1DA57A' },
        }),
        // addWebpackExternals({
        //     'react': 'React',
        //     'react-dom': 'ReactDOM',
        //
        // }),
        // 通过这个方法可以直接修改config加入更多自定义配置
        setGlobalObject()
    ),
    paths:function (paths,env) {
        // console.log(paths)
        // 自定义paths，比如build目录路径
        // paths.appBuild=path.resolve('../taishiServer/src/main/resources/static')
        return paths;
    },


}